---
dataset_info:
  features:
  - name: image
    dtype: image
  - name: objects
    struct:
    - name: bbox
      list:
        list: int64
    - name: categories
      list:
        class_label:
          names:
            '0': Corn leaf blight
            '1': Tomato Early blight leaf
            '2': Potato leaf early blight
            '3': Potato leaf late blight
            '4': Blueberry leaf
            '5': grape leaf black rot
            '6': Bell_pepper leaf spot
            '7': Cherry leaf
            '8': Peach leaf
            '9': Soyabean leaf
            '10': Strawberry leaf
            '11': Apple Scab Leaf
            '12': Corn rust leaf
            '13': Apple leaf
            '14': Corn Gray leaf spot
            '15': Tomato leaf mosaic virus
            '16': Tomato mold leaf
            '17': Tomato leaf yellow virus
            '18': Tomato leaf bacterial spot
            '19': Tomato leaf late blight
            '20': Squash Powdery mildew leaf
            '21': Bell_pepper leaf
            '22': grape leaf
            '23': Apple rust leaf
            '24': Tomato Septoria leaf spot
            '25': Tomato leaf
            '26': Raspberry leaf
            '27': Potato leaf
            '28': Tomato two spotted spider mites leaf
  splits:
  - name: train
    num_bytes: 1027346536
    num_examples: 2346
  download_size: 975874080
  dataset_size: 1027346536
configs:
- config_name: default
  data_files:
  - split: train
    path: data/train-*
---
# Plant Doc Detection

A dataset for object detection of various plant leaf diseases. The dataset contains 2,346 images with 8,435 bounding box annotations across 29 categories.

This dataset is indexed on https://project-agml.github.io/ as part of the AgML python library.

## Citation

```bibtex
@inproceedings{10.1145/3371158.3371196,
author = {Singh, Davinder and Jain, Naman and Jain, Pranjali and Kayal, Pratik and Kumawat, Sudhakar and Batra, Nipun},
title = {PlantDoc: A Dataset for Visual Plant Disease Detection},
year = {2020},
isbn = {9781450377386},
publisher = {Association for Computing Machinery},
url = {https://doi.org/10.1145/3371158.3371196},
doi = {10.1145/3371158.3371196},
booktitle = {Proceedings of the 7th ACM IKDD CoDS and 25th COMAD},
pages = {249–253},
series = {CoDS COMAD 2020}
}
```