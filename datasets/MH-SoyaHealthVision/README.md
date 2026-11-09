---
dataset_info:
  features:
  - name: image
    dtype: image
  - name: label
    dtype:
      class_label:
        names:
          '0': Caterpillar_Semilooper_Pest
          '1': Frog_Leaf_Eye
          '2': Healthy
          '3': Mosaic
          '4': Rust
          '5': Spectoria_Brown_Spot
  splits:
  - name: train
    num_bytes: 6310902405
    num_examples: 2782
  download_size: 6127186815
  dataset_size: 6310902405
configs:
- config_name: default
  data_files:
  - split: train
    path: data/train-*
license: cc-by-4.0
task_categories:
- image-classification
size_categories:
- 1K<n<10K
---
# MH SoyaHealthVision Disease Classification Leaf

A dataset for disease classification of soybean leaves. The dataset contains 2,782 images across 6 classes: Caterpillar_Semilooper_Pest, Frog_Leaf_Eye, Healthy, Mosaic, Rust, Spectoria_Brown_Spot.  
Images per class:
- Caterpillar_Semilooper_Pest: 582
- Frog_Leaf_Eye: 169
- Healthy: 204
- Mosaic: 707
- Rust: 852
- Spectoria_Brown_Spot: 268

This dataset is indexed on https://project-agml.github.io/ as part of the AgML python library.

## Citation

```bibtex
@article{shinde2025indian,
  title={An Indian UAV and leaf image dataset for integrated crop health assessment of soybean crop},
  author={Shinde, Sayali and Attar, Vahida},
  journal={Data in Brief},
  volume={60},
  pages={111517},
  year={2025},
  publisher={Elsevier}
}
```

Shinde, Sayali; Attar, Dr.Vahida; Technological University,Pune, COEP ; Technology Innovation Hub, Indian Statistical Institute Kolkata, IDEAS (2024), “MH-SoyaHealthVision: An Indian UAV and Leaf Image Dataset for Integrated Crop Health Assessment”, Mendeley Data, V1, doi: 10.17632/hkbgh5s3b7.1