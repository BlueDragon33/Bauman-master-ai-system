import {
  BaumanDeviceError,
  type BaumanControlIdentity,
} from "./device-store";

export type BaumanContentReviewStatus = "pending" | "approved" | "rejected" | "published";
export type BaumanContentReviewOperation = "approve" | "reject" | "publish";

type ReviewRow = {
  review_id: string;
  subject_id: string;
  resource_type: string;
  resource_id: string;
  revision: string;
  content_hash: string;
  source_path: string | null;
  summary: string | null;
  request_hash: string;
  status: string;
  requested_by: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  decision_note: string | null;
  published_at: string | null;
  published_by: string | null;
};

type ReviewCommandRow = {
  command_id: string;
  review_id: string;
  operation: string;
  expected_status: string;
  payload_hash: string;
  state: string;
  result_status: string | null;
  actor: string;
  execution_nonce: string;
  error_code: string | null;
};

function text(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validSubjectId(value: string) {
  return /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value);
}

function validContentHash(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

function normalizeStatus(value: unknown): BaumanContentReviewStatus | null {
  return value === "pending" || value === "approved" || value === "rejected" || value === "published"
    ? value
    : null;
}

function normalizeOperation(value: unknown): BaumanContentReviewOperation | null {
  return value === "approve" || value === "reject" || value === "publish" ? value : null;
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicReview(row: ReviewRow) {
  return {
    reviewId: row.review_id,
    subjectId: row.subject_id,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    revision: row.revision,
    contentHash: row.content_hash,
    sourcePath: row.source_path,
    summary: row.summary,
    status: normalizeStatus(row.status) ?? "pending",
    requestedBy: row.requested_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    decisionNote: row.decision_note,
    publishedAt: row.published_at,
    publishedBy: row.published_by,
  };
}

async function reviewRow(database: D1Database, reviewId: string) {
  return database.prepare(
    `SELECT review_id, subject_id, resource_type, resource_id, revision, content_hash, source_path, summary, request_hash,
            status, requested_by, created_at, updated_at, reviewed_at, reviewed_by, decision_note, published_at, published_by
       FROM bm_content_reviews WHERE review_id=?`,
  ).bind(reviewId).first<ReviewRow>();
}

async function commandRow(database: D1Database, commandId: string) {
  return database.prepare(
    `SELECT command_id, review_id, operation, expected_status, payload_hash, state, result_status, actor,
            execution_nonce, error_code
       FROM bm_content_review_commands WHERE command_id=?`,
  ).bind(commandId).first<ReviewCommandRow>();
}

async function audit(database: D1Database, actor: string, action: string, target: string, detail: Record<string, unknown>) {
  await database.prepare(
    "INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES (?, ?, ?, ?)",
  ).bind(actor, action, target, JSON.stringify(detail)).run();
}

function requireReviewer(identity: BaumanControlIdentity) {
  if (identity.role === "viewer") {
    throw new BaumanDeviceError("Cần quyền reviewer trở lên để đọc Content Review Bauman.", 403, "REVIEWER_REQUIRED");
  }
}

function requireSubmitter(identity: BaumanControlIdentity) {
  if (identity.role !== "publisher" && identity.role !== "owner") {
    throw new BaumanDeviceError("Cần quyền publisher hoặc owner để tạo Content Review Bauman.", 403, "PUBLISHER_REQUIRED");
  }
}

function requireOperationRole(identity: BaumanControlIdentity, operation: BaumanContentReviewOperation) {
  if (operation === "publish") {
    if (identity.role !== "publisher" && identity.role !== "owner") {
      throw new BaumanDeviceError("Chỉ publisher hoặc owner được publish Content Review Bauman.", 403, "PUBLISHER_REQUIRED");
    }
    return;
  }
  requireReviewer(identity);
}

export async function createBaumanContentReview(
  database: D1Database,
  identity: BaumanControlIdentity,
  payload: Record<string, unknown>,
) {
  requireSubmitter(identity);

  const reviewId = text(payload.reviewId, 64).toLowerCase();
  const subjectId = text(payload.subjectId, 64).toLowerCase();
  const resourceType = text(payload.resourceType, 64).toLowerCase();
  const resourceId = text(payload.resourceId, 160);
  const revision = text(payload.revision, 120);
  const contentHash = text(payload.contentHash, 64).toLowerCase();
  const sourcePath = text(payload.sourcePath, 320) || null;
  const summary = text(payload.summary, 600) || null;

  if (!validUuid(reviewId)) throw new BaumanDeviceError("reviewId không hợp lệ.", 400, "INVALID_REVIEW_ID");
  if (!validSubjectId(subjectId)) throw new BaumanDeviceError("subjectId không hợp lệ.", 400, "INVALID_SUBJECT_ID");
  if (!resourceType || !resourceId || !revision) {
    throw new BaumanDeviceError("Thiếu resourceType/resourceId/revision.", 400, "INVALID_REVIEW_RESOURCE");
  }
  if (!validContentHash(contentHash)) {
    throw new BaumanDeviceError("contentHash phải là SHA-256 hex.", 400, "INVALID_CONTENT_HASH");
  }

  const canonical = JSON.stringify({ subjectId, resourceType, resourceId, revision, contentHash, sourcePath, summary });
  const requestHash = await sha256Hex(canonical);
  const existing = await reviewRow(database, reviewId);
  if (existing) {
    if (existing.request_hash !== requestHash) {
      throw new BaumanDeviceError("reviewId đã được dùng cho payload khác.", 409, "REVIEW_ID_PAYLOAD_MISMATCH");
    }
    return { review: publicReview(existing), replayed: true };
  }

  const duplicate = await database.prepare(
    `SELECT review_id FROM bm_content_reviews
      WHERE subject_id=? AND resource_type=? AND resource_id=? AND revision=? LIMIT 1`,
  ).bind(subjectId, resourceType, resourceId, revision).first<{ review_id: string }>();
  if (duplicate) {
    throw new BaumanDeviceError("Revision này đã có Content Review.", 409, "REVIEW_REVISION_EXISTS");
  }

  await database.prepare(
    `INSERT INTO bm_content_reviews
       (review_id, subject_id, resource_type, resource_id, revision, content_hash, source_path, summary,
        request_hash, status, requested_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
  ).bind(
    reviewId,
    subjectId,
    resourceType,
    resourceId,
    revision,
    contentHash,
    sourcePath,
    summary,
    requestHash,
    identity.actor,
  ).run();

  await audit(database, identity.actor, "content_review_submitted", `review:${reviewId}`, {
    reviewId,
    subjectId,
    resourceType,
    resourceId,
    revision,
    contentHash,
    sourcePath,
    metadataOnly: true,
  });

  const created = await reviewRow(database, reviewId);
  if (!created) throw new BaumanDeviceError("Không thể tạo Content Review Bauman.", 500, "CONTENT_REVIEW_WRITE_FAILED");
  return { review: publicReview(created), replayed: false };
}

export async function listBaumanContentReviews(
  database: D1Database,
  identity: BaumanControlIdentity,
  statusValue?: unknown,
) {
  requireReviewer(identity);
  const status = statusValue ? normalizeStatus(statusValue) : null;
  if (statusValue && !status) throw new BaumanDeviceError("Trạng thái Content Review không hợp lệ.", 400, "INVALID_REVIEW_STATUS");

  const rows = status
    ? await database.prepare(
      `SELECT review_id, subject_id, resource_type, resource_id, revision, content_hash, source_path, summary, request_hash,
              status, requested_by, created_at, updated_at, reviewed_at, reviewed_by, decision_note, published_at, published_by
         FROM bm_content_reviews WHERE status=? ORDER BY created_at DESC LIMIT 300`,
    ).bind(status).all<ReviewRow>()
    : await database.prepare(
      `SELECT review_id, subject_id, resource_type, resource_id, revision, content_hash, source_path, summary, request_hash,
              status, requested_by, created_at, updated_at, reviewed_at, reviewed_by, decision_note, published_at, published_by
         FROM bm_content_reviews ORDER BY created_at DESC LIMIT 300`,
    ).all<ReviewRow>();

  return rows.results.map(publicReview);
}

export async function executeBaumanContentReviewCommand(
  database: D1Database,
  identity: BaumanControlIdentity,
  payload: Record<string, unknown>,
) {
  const commandId = text(payload.commandId, 64).toLowerCase();
  const reviewId = text(payload.reviewId, 64).toLowerCase();
  const operation = normalizeOperation(payload.operation);
  const expectedStatus = normalizeStatus(payload.expectedStatus);
  const decisionNote = text(payload.decisionNote, 600) || null;

  if (!validUuid(commandId)) throw new BaumanDeviceError("commandId không hợp lệ.", 400, "INVALID_COMMAND_ID");
  if (!validUuid(reviewId)) throw new BaumanDeviceError("reviewId không hợp lệ.", 400, "INVALID_REVIEW_ID");
  if (!operation) throw new BaumanDeviceError("Thao tác Content Review không hợp lệ.", 400, "INVALID_REVIEW_OPERATION");
  if (!expectedStatus) throw new BaumanDeviceError("expectedStatus không hợp lệ.", 400, "INVALID_EXPECTED_STATUS");

  requireOperationRole(identity, operation);

  if ((operation === "approve" || operation === "reject") && expectedStatus !== "pending") {
    throw new BaumanDeviceError("Approve/reject chỉ áp dụng cho Content Review pending.", 409, "REVIEW_STATE_CONFLICT");
  }
  if (operation === "publish" && expectedStatus !== "approved") {
    throw new BaumanDeviceError("Publish chỉ áp dụng cho Content Review approved.", 409, "REVIEW_STATE_CONFLICT");
  }

  const payloadHash = await sha256Hex(JSON.stringify({ reviewId, operation, expectedStatus, decisionNote }));
  const existingCommand = await commandRow(database, commandId);
  if (existingCommand) {
    if (existingCommand.payload_hash !== payloadHash) {
      throw new BaumanDeviceError("commandId đã được dùng cho payload khác.", 409, "COMMAND_ID_PAYLOAD_MISMATCH");
    }
    if (existingCommand.state === "completed" && normalizeStatus(existingCommand.result_status)) {
      const existingReview = await reviewRow(database, reviewId);
      return {
        commandId,
        reviewId,
        operation,
        status: existingCommand.result_status as BaumanContentReviewStatus,
        replayed: true,
        review: existingReview ? publicReview(existingReview) : null,
      };
    }
    throw new BaumanDeviceError(
      "Lệnh Content Review đã được nhận nhưng chưa có kết quả chắc chắn; không tự động chạy lại.",
      409,
      existingCommand.state === "processing" ? "COMMAND_IN_PROGRESS" : "COMMAND_REQUIRES_RECONCILIATION",
    );
  }

  const current = await reviewRow(database, reviewId);
  if (!current) throw new BaumanDeviceError("Không tìm thấy Content Review.", 404, "CONTENT_REVIEW_NOT_FOUND");
  if (normalizeStatus(current.status) !== expectedStatus) {
    throw new BaumanDeviceError(
      `Snapshot Content Review đã thay đổi: expected ${expectedStatus}, hiện tại ${current.status}.`,
      409,
      "REVIEW_STATE_CONFLICT",
    );
  }

  const targetStatus: BaumanContentReviewStatus =
    operation === "approve" ? "approved" : operation === "reject" ? "rejected" : "published";
  const executionNonce = crypto.randomUUID();

  await database.prepare(
    `INSERT OR IGNORE INTO bm_content_review_commands
       (command_id, review_id, operation, expected_status, payload_hash, state, actor, execution_nonce)
     VALUES (?, ?, ?, ?, ?, 'processing', ?, ?)`,
  ).bind(commandId, reviewId, operation, expectedStatus, payloadHash, identity.actor, executionNonce).run();

  const owned = await commandRow(database, commandId);
  if (!owned) throw new BaumanDeviceError("Không thể ghi Content Review command ledger.", 500, "COMMAND_LEDGER_WRITE_FAILED");
  if (owned.payload_hash !== payloadHash) {
    throw new BaumanDeviceError("commandId đã được dùng cho payload khác.", 409, "COMMAND_ID_PAYLOAD_MISMATCH");
  }
  if (owned.execution_nonce !== executionNonce) {
    throw new BaumanDeviceError("Lệnh cùng commandId đang được xử lý.", 409, "COMMAND_IN_PROGRESS");
  }

  try {
    const mutation = operation === "publish"
      ? await database.prepare(
        `UPDATE bm_content_reviews
            SET status='published', published_at=CURRENT_TIMESTAMP, published_by=?, updated_at=CURRENT_TIMESTAMP
          WHERE review_id=? AND status='approved'`,
      ).bind(identity.actor, reviewId).run()
      : await database.prepare(
        `UPDATE bm_content_reviews
            SET status=?, reviewed_at=CURRENT_TIMESTAMP, reviewed_by=?, decision_note=?, updated_at=CURRENT_TIMESTAMP
          WHERE review_id=? AND status='pending'`,
      ).bind(targetStatus, identity.actor, decisionNote, reviewId).run();

    if (Number(mutation.meta.changes ?? 0) !== 1) {
      await database.prepare(
        "UPDATE bm_content_review_commands SET state='failed', error_code='REVIEW_STATE_CONFLICT', completed_at=CURRENT_TIMESTAMP WHERE command_id=? AND execution_nonce=?",
      ).bind(commandId, executionNonce).run();
      throw new BaumanDeviceError("Trạng thái Content Review đã thay đổi trước khi lệnh được áp dụng.", 409, "REVIEW_STATE_CONFLICT");
    }

    const auditAction =
      operation === "approve" ? "content_review_approved"
        : operation === "reject" ? "content_review_rejected"
          : "content_review_published";
    await audit(database, identity.actor, auditAction, `review:${reviewId}`, {
      commandId,
      expectedStatus,
      resultStatus: targetStatus,
      decisionNote,
      metadataOnly: true,
    });

    await database.prepare(
      "UPDATE bm_content_review_commands SET state='completed', result_status=?, completed_at=CURRENT_TIMESTAMP WHERE command_id=? AND execution_nonce=?",
    ).bind(targetStatus, commandId, executionNonce).run();

    const updated = await reviewRow(database, reviewId);
    if (!updated || normalizeStatus(updated.status) !== targetStatus) {
      throw new BaumanDeviceError("Content Review readback không khớp kết quả lệnh.", 502, "CONTENT_REVIEW_READBACK_MISMATCH");
    }
    return {
      commandId,
      reviewId,
      operation,
      status: targetStatus,
      replayed: false,
      review: publicReview(updated),
    };
  } catch (error) {
    if (!(error instanceof BaumanDeviceError && error.code === "REVIEW_STATE_CONFLICT")) {
      try {
        await database.prepare(
          "UPDATE bm_content_review_commands SET state='uncertain', error_code='COMMAND_REQUIRES_RECONCILIATION' WHERE command_id=? AND execution_nonce=? AND state='processing'",
        ).bind(commandId, executionNonce).run();
      } catch {
        // Fail closed: never blind-replay an unresolved review mutation.
      }
    }
    throw error;
  }
}
