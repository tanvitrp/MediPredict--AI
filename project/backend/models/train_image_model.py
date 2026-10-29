import runpy
from pathlib import Path


ROOT_TRAIN_SCRIPT = Path(__file__).resolve().parents[3] / "train.py"


if __name__ == "__main__":
    runpy.run_path(str(ROOT_TRAIN_SCRIPT), run_name="__main__")
