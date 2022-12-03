---
title: FARM(FastAPI, React, MongoDB)の構築#1
description: FARM(FastAPI, React, MongoDB)によるフルスタックWebアプリケーションの開発環境を構築する方法を紹介します。
category: [FastAPI, React, MongoDB]
createdAt: 2022-08-29
updatedAt: 2022-12-01
draft: false
layout: /src/layouts/Article.astro
---

# FARM(FastAPI, React, MongoDB)の構築#1

LAMP(Linux, Apache, MySQL, PHP)は 20 年近く前から運用されている Web アプリケーションの開発環境です。しかし、現在では LAMP の代わりに FARM(FastAPI, React, MongoDB)や MERN(MongoDB, Express, React, Node.js)が用いられるケースが多いです。FARM は、Linux, FastAPI, React, MongoDB の頭文字をとったものです。FARM は、LAMP よりも高速で、より多くの機能を備えています。FARM を使うことで、より高速な Web アプリケーションを開発することができます。今回は比較的モダンな FARM を使って、Web アプリケーションの開発環境を構築する方法を紹介します。

## 前提条件

DB, バックエンド, フロントエンドをコンテナ化し、Docker Compose でプロジェクトの管理を行います。そのため、以下のソフトウェアがインストールされている必要があります。

- Node.js
- Docker

## プロジェクトの構築

### プロジェクトの構成

まずはプロジェクトのディレクトリを作成します。

```bash
mkdir FARM && cd FARM
mkdir api front
mkdir docker docker/api docker/front
```

ここまでで、以下のようなディレクトリ構成になります。

```bash
.
 ├── api
 ├── docker
 │   ├── api
 │   └── front
 └── front
```

### コンテナの構築

VSCode でプロジェクトを開き、`docker-compose.yml`を作成します。

```bash
version: '3'
services:
    mongo:
    image: mongo
    container_name: mongo_db
    restart: always
    environment:
        MONGO_INITDB_ROOT_USERNAME: root
        MONGO_INITDB_ROOT_PASSWORD: password
    ports:
        - 27017:27017
    volumes:
        - mongo_data:/data/db
        - mongo_data:/data/configdb
    mongo-express:
    image: mongo-express
    container_name: mongo_express
    restart: always
    ports:
        - 8081:8081
    environment:
        ME_CONFIG_MONGODB_ADMINUSERNAME: root
        ME_CONFIG_MONGODB_ADMINPASSWORD: password
        ME_CONFIG_MONGODB_SERVER: mongo
    depends_on:
        - mongo

    api:
    build:
        context: .
        dockerfile: ./docker/api/Dockerfile
    container_name: api
    volumes:
        - ./api:/api
    working_dir: /api
    ports:
        - 8000:8000
    tty: true
    stdin_open: true
    depends_on:
        - mongo

    front:
    build:
        context: .
        dockerfile: ./docker/front/Dockerfile
    container_name: front
    volumes:
        - ./front:/front
    working_dir: /front
    ports:
        - 3000:3000
    tty: true
    stdin_open: true
volumes:
    mongo_data:
```

続いて FastAPI の Dockerfile を作成します。`./docker/api/Dockerfile`を作成し、以下の内容を記述します。

```bash
FROM python:3-slim
WORKDIR /api
COPY ./api /api
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 8000
ENV CI=true
CMD ["python", "main.py"]
```

FastAPI と uvicorn、MongoDB のドライバーをインストールするために、`./api/requirements.txt`を作成します。

```bash
fastapi
uvicorn
pymongo
```

API 側のコードを記述します。`./api/main.py`を作成し、以下の内容を記述します。

```python
import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

最後にフロントエンドの構築をしていきます。まずは node 環境 の Dockerfile を作成します。`./docker/front/Dockerfile`を作成し、以下の内容を記述します。

```bash
FROM node:16-slim
WORKDIR /front
COPY ./front /front
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

`./front` ディレクトリに移動し、React のプロジェクトを作成します。今回はビルドツールとして[Vite](https://vitejs.dev/)を使用します。

```bash
npm create vite@latest .

✔ Select a framework: › react
✔ Select a variant: › react-ts

npm install
```

Vite の設定を行っていきます。`./front/vite.config.ts`を作成し、以下の内容を記述します。

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
});
```

ここまでのディレクトリ構成は以下のようになります。

```bash
.
├── api
│   ├── main.py
│   └── requirements.txt
├── docker
│   ├── api
│   │   └── Dockerfile
│   └── front
│       └── Dockerfile
├── docker-compose.yaml
└── front [9 entries exceeds filelimit, not opening dir]
```

## コンテナの起動

`cd`でプロジェクトのルートディレクトリに移動し、`docker-compose up -d`を実行します。

```bash
$ docker-compose up -d
```

![image](https://res.cloudinary.com/dlsmszcqb/image/upload/v1661751967/fig1_1fb32c099e.png)

無事すべてのコンテナが起動したら以下のリンクをクリックして、ブラウザでアクセスしてみましょう。

- API : [http://localhost:8000](http://localhost:8000)
- フロントエンド : [http://localhost:3000](http://localhost:3000)
- MongoExpress : [http://localhost:8081](http://localhost:8081)

## まとめ

今回は FARM の環境構築を行いました。FastAPI と React で簡単な CRUD アプリを作成しました。今回は環境構築のみを行いましたが、次回は FastAPI と React で CRUD アプリを作成していきます。
