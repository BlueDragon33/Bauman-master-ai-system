# PYTHON04 data tooling contract

Data/file support is explicit per-run text input, Python csv/json and scoped
filesystem I/O. Request names use safe relative alphanumeric components and
extensions, no absolute path, `..`, null/backslash or reserved cell-source
filename. Max 8 files and 16 KiB input. Container filesystem is disposable;
root tmpfs 8 MiB and per-file RLIMIT 1 MiB bound generated data. No host upload
path or arbitrary URL loader is accepted. No privileged deserialization.

Public demonstration dataset `python04.demo.values.v1`: inline CSV
`value\n42\n`, schema one integer column `value`, revision 1, synthetic
test data created by the repository author, no personal data or third-party
license dependency, UTF-8, 9 bytes. Input must be supplied explicitly as
`data/demo.csv`; no online/offline dataset availability is fabricated.
Integration tests read it and prove it is absent in the next fresh run.

The learner may download their source as UTF-8 text `practice.py`; no generated
binary/artifact export is exposed by this provider. Browser file input is a
text JSON map, not permission to execute host uploads. No server retention or
logging of full private code/data. NumPy/Pandas integration, dataset catalog and
external data access remain unavailable; this capability does not redefine
statistics/database/ML theory or PYTHON02 curriculum.
