from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
import torch
from torch.utils.data import Dataset
import pandas as pd

# Loads in data
class TransactionDataset(Dataset):
    def __init__(self, texts, labels):
        self.texts = texts
        self.labels = labels

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        return {
            "text": self.texts[idx],
            "label": self.labels[idx]
        }


# Loads in CSV file with data for fine tuning
df = pd.read_csv("transactions_labeled.csv")
texts = df["text"].tolist()
labels_ie = df["label_income_expense"].tolist()

dataset = TransactionDataset(texts, labels_ie)

# Loads in tokenizer and model
model_name = "yiyanghkust/finbert-tone"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)  

# Tokenises data
def tokenize_fn(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

# Wraps the dataset from the csv file
class TokenizedDataset(Dataset):
    def __init__(self, ds, tokenizer):
        self.ds = ds
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.ds)

    def __getitem__(self, idx):
        item = self.ds[idx]
        enc = self.tokenizer(item["text"], padding="max_length", truncation=True, max_length=128, return_tensors="pt")
        return {
            "input_ids": enc["input_ids"].squeeze(),
            "attention_mask": enc["attention_mask"].squeeze(),
            "labels": torch.tensor(item["label"], dtype=torch.long)
        }

tokenized = TokenizedDataset(dataset, tokenizer)

# Sets up trainer that will fine-tune finBERT
# 4. Set up Trainer
training_args = TrainingArguments(
    output_dir="./finbert-finetuned",
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    save_steps=500,
    save_total_limit=2,
    evaluation_strategy="epoch",
    logging_steps=100
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized,
    eval_dataset=tokenized,
)

# Trains the model
trainer.train()

# Saves everything
model.save_pretrained("./finbert-finetuned-ie")
tokenizer.save_pretrained("./finbert-finetuned-ie")