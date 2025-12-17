# ĐÁNH GIÁ CÁC MÔ HÌNH


## Bảng đánh giá hiệu suất mô hình
Các mô hình được huấn luyện trên tập dữ liệu các issue trong các dự án lớn được đăng công khai trên các nguồn Apache, Jira, Atlassian. Do dữ liệu lấy thủ công được còn giới hạn, chúng tôi đã bổ sung thêm bằng tập dữ liệu TAWOS có sẵn. 

Mỗi dòng dữ liệu gồm các đặc trứng chính: Key dự án, Title + Description (combined_text) và story point. Bộ dữ liệu gồm ~ 90000 dòng bao gồm cả tiếng Anh và tiếng Việt.
| Model | Embedding Model | MAE | MSE | RMSE | R² |
|:---:|:--:|:--:|:--:|:--:|:--:|
| XGBoostRegressor | paraphrase-multilingual-MiniLM-L12-v2 | 1.1615 | 2.6034 | 1.6135 | 0.5517 |
| LightGBMRegressor | paraphrase-multilingual-MiniLM-L12-v2 | 1.3510 | 3.2147 | 1.7930 | 0.4464 |
| CatBoostRegressor | paraphrase-multilingual-MiniLM-L12-v2 | 1.3167 | 3.0773 | 1.7542 | 0.4701 |
| RandomForestRegressor | paraphrase-multilingual-MiniLM-L12-v2 | 1.5596 | 4.1192 | 2.0296 | 0.2906 |
| DecisionTreeRegressor | paraphrase-multilingual-MiniLM-L12-v2 | 1.6668 | 5.0063 | 2.2375 | 0.1378 |
| XGBoostRegressor | paraphrase-multilingual-mpnet-base-v2 | 1.1052 | 2.4207 | 1.5558 | 0.5831 |
| LightGBMRegressor | paraphrase-multilingual-mpnet-base-v2 | 1.2965 | 3.0042 | 1.7333 | 0.4826 |



## Thời gian Embedding
|Embedding Model| Embedding time| Dense|
|:--:|:--:|:--:|
|paraphrase-multilingual-MiniLM-L12-v2|995.79s ≈ 16m 36s|384|
|paraphrase-multilingual-mpnet-base-v2|1,145.3s ≈ 19m 5.3s|768|

## Thời gian Huấn luyện mô hình
Quá trình nhúng vector và huấn luyện mô hình được chạy trên máy tính với GPU NVIDIA GeForce RTX 3050 i5.

|Model|Embedding Model |Train time|
|:---:|:--:|:--:|
|XGBoostRegressor|paraphrase-multilingual-MiniLM-L12-v2|706.77s≈ 11m 47s|
|XGBoostRegressor|paraphrase-multilingual-mpnet-base-v2|1.784,3s ≈ 29m 44.3s|
|LightGBMRegressor|paraphrase-multilingual-MiniLM-L12-v2|187.7s ≈ 3m 7.7s|
|LightGBMRegressor|paraphrase-multilingual-mpnet-base-v2|409.4s ≈ 6m 49.4s|
