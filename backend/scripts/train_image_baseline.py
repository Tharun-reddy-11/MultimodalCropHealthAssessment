"""Train a reproducible MobileNetV2 image-only baseline on MangoLeafBD Dataset.
This script deliberately does not manufacture environmental values or fusion labels.
"""
from __future__ import annotations
import argparse, json, random
from datetime import datetime, timezone
from pathlib import Path
import torch
from torch import nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms

ROOT=Path(__file__).resolve().parents[2]; SOURCE=ROOT/'datasets'/'MangoLeafBD Dataset'; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
parser=argparse.ArgumentParser();parser.add_argument('--epochs',type=int,default=8);parser.add_argument('--batch-size',type=int,default=24);parser.add_argument('--seed',type=int,default=42); args=parser.parse_args()
if not SOURCE.exists(): raise SystemExit(f'Missing source dataset: {SOURCE}')
random.seed(args.seed);torch.manual_seed(args.seed)
tfm=transforms.Compose([transforms.Resize(256),transforms.CenterCrop(224),transforms.ToTensor(),transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
dataset=datasets.ImageFolder(SOURCE,tfm)
if len(dataset)<20 or len(dataset.classes)<2: raise SystemExit('Need at least 20 images across two classes.')
n=len(dataset); nval=max(1,round(n*.15)); ntrain=n-nval; train,val=random_split(dataset,[ntrain,nval],generator=torch.Generator().manual_seed(args.seed))
device='cuda' if torch.cuda.is_available() else 'cpu'; model=models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT); model.classifier[1]=nn.Linear(model.last_channel,len(dataset.classes));model.to(device)
opt=torch.optim.AdamW(model.parameters(),lr=2e-4);lossfn=nn.CrossEntropyLoss();loader=DataLoader(train,batch_size=args.batch_size,shuffle=True,num_workers=0);vloader=DataLoader(val,batch_size=args.batch_size,num_workers=0)
best=(-1,None)
for epoch in range(args.epochs):
    model.train()
    for x,y in loader: opt.zero_grad();loss=lossfn(model(x.to(device)),y.to(device));loss.backward();opt.step()
    model.eval();correct=total=0
    with torch.inference_mode():
        for x,y in vloader: pred=model(x.to(device)).argmax(1).cpu();correct+=(pred==y).sum().item();total+=len(y)
    score=correct/total;print(f'epoch {epoch+1}/{args.epochs}: validation_accuracy={score:.4f}')
    if score>best[0]: best=(score,{k:v.cpu() for k,v in model.state_dict().items()})
payload={'version':f'mobilenetv2-image-baseline-{datetime.now(timezone.utc).date().isoformat()}','trained_at':datetime.now(timezone.utc).isoformat(),'labels':dataset.classes,'state_dict':best[1],'validation_accuracy':best[0],'validation_size':nval,'train_size':ntrain,'seed':args.seed,'source':'datasets/MangoLeafBD Dataset','limitations':'Image-only model. No environmental or multimodal metrics are claimed.'}
torch.save(payload,ART/'image_baseline.pt'); (ART/'image_baseline_metrics.json').write_text(json.dumps({k:v for k,v in payload.items() if k!='state_dict'},indent=2),encoding='utf-8');print('Saved',ART/'image_baseline.pt')
