export const PYTHON_TASKS = Object.freeze({
  "py-beginner-sum": {
    publicTests: [
      { id: "positive", stdin: "2 3\n", expected: "5\n" },
      { id: "negative", stdin: "-5 7\n", expected: "2\n" }
    ],
    hiddenTests: [
      { id: "zero", stdin: "0 0\n", expected: "0\n" },
      { id: "large", stdin: "1000000 2000000\n", expected: "3000000\n" }
    ]
  },
  "py-debug-index": {
    publicTests: [
      { id: "standard", stdin: "", expected: "10\n20\n30\n" }
    ],
    hiddenTests: [
      { id: "repeat", stdin: "", expected: "10\n20\n30\n" }
    ]
  },
  "py-assessment-even": {
    publicTests: [
      { id: "even", stdin: "8\n", expected: "EVEN\n" },
      { id: "odd", stdin: "7\n", expected: "ODD\n" }
    ],
    hiddenTests: [
      { id: "zero", stdin: "0\n", expected: "EVEN\n" },
      { id: "negative", stdin: "-3\n", expected: "ODD\n" },
      { id: "large", stdin: "1000001\n", expected: "ODD\n" }
    ]
  }
});

export function pythonTask(taskId) {
  return PYTHON_TASKS[String(taskId || "")] || null;
}
