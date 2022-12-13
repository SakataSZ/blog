---
title: ブログをNext.jsからAstroに刷新したお話
description: Next.jsからAstroに刷新したのでその理由と変更点をまとめました。
category: [Next.js, Astro, Headless CMS]
createdAt: 2022-12-13
updatedAt: 2022-12-13
draft: false
layout: /src/layouts/Article.astro
---

# はじめに

Next.js 最高ですよね。SSG, SSR, ISR をパパっと実装できるし、バックエンドからフロントエンドまで一貫して開発できるし、**TypeScript** もサポートしてくれます。**Prisma** との連携は素晴らしいし、**React 資源**も豊富なので爆速でフルスタックアプリケーションを開発&デプロイできてしまいます。

これだけ褒めちぎっているにもかかわらず、私が **Next.js から Astro** に刷新した理由を書いていきます。

## Next.js をやめた理由

### SPA である必要がない

公然の事実として **SPA** は FCP(First Contentful Paint)が遅いです。SPA は**初回アクセス時に JavaScript を読み込む**必要があるため、JavaScript の読み込みが完了するまでに時間がかかります。

その問題を解決するために Next.js では **SSR/SSG/ISR** などのアプローチを取る訳です。しかし、そもそも React DOM や next/dist がそこそこ重く、それに加えて MUI などのコンポーネントライブラリを使用するとバンドルサイズは一気に大きくなります。

これでは結局 SPA の問題は解決できません。

### ビルド時間の問題

記事の数が少ない現段階ではあまり問題になりませんが、Next.js の SSG はかなり**ビルドに時間**がかかります。**Next.js で 2 分**ほどかかるビルドを **Astro で 10 秒**ほどに短縮できました。後のことを考えるとビルド時間の短縮は大事です。

## Astro を採用した理由

### コンテンツファースト

Astro は**コンテンツファースト**のフレームワークです。ブログは複雑なアプリケーションではないので、Astro を採用することで他のフレームワークと比較して圧倒的なパフォーマンスを得ることができます。一方ネイティブアプリケーションのような**複雑なアプリケーション**を開発する場合は **Next.js** などのフレームワークを採用するべきと考えます。

### Jamstack の廃止

当ブログは元々 **Strapi** や **MicroCMS** などの **Headless CMS** を使用し、API 経由で記事の取得とページの生成を行っていました。いわゆる **Jamstack** です。

しかし、Headless CMS で記事を書くより、**VSCode** の補完機能を活用して Markdown で記事を書く方が素早く記事を書くことができます。
また、記事の管理も Git で行うことができるので、記事のバージョン管理もできます。

以上の理由から

1. 記事を**Markdown**で書く
2. **Git** で記事を管理する
3. **Astro**で記事をビルドする

というような方式を採用しました。(昔ながらの方式！)

また Astro には**Shiki**と**prism**が組み込みでサポートされているため、コードブロックのシンタックスハイライトも設定不要で実現できます。

### Astro アイランド

恐らく**Astro Island** (Component Island)という言葉を聞いたことがない方が殆どでしょう。
**Astro Island**の採用によって殆どのコンテンツは**静的な HTML** に変換され、**JavaScript** は**コンポーネント単位**で必要に応じて読み込まれます。
詳しくは[公式ドキュメント](https://docs.astro.build/ja/concepts/islands/)を参照してください。

以下は Astro で作成したブログを読み込んだときのネットワークの状況です(もちろんキャッシュは無効化しています)。**ネイティブな Astro コンポーネント** のみでページを生成した場合、クライアントサイドでは**JavaScript は一切使用されません**。画像等のリソースを除いた場合、ページのサイズはなんと**5kB**ほどしかありません!

![image](https://res.cloudinary.com/dlsmszcqb/image/upload/v1670946137/blog/Articles/next-to-astro/Fig1_o9bn0p.webp)

### コードの可読性が高い

個人的な感想ですが、**React**(jsx/tsx)と比較して**コードの可読性**が高いと感じました。**Vue**や**Svelte**と似たような感じで書けます。以下にコードの一例を示します。

記事一覧を表示しているページの実際のコードは以下の通りです。

```tsx
---
import ArticleCard from "@/components/ArticleCard.astro";
import Container from "@/components/Container.astro";
import Document from "@/layouts/Document.astro";
import Stack from "@/components/Stack.astro";
import Hero from "@/components/Hero.astro";

import { getSummaries } from "@/utils/article.astro";

const summaries = await getSummaries();
---

<!-- HTML -->
<Document title="Blog">
  <Hero title="Tech Blog🚀" />
  <Container marginY={2}>
    <h2 style="margin-bottom: 1rem;">記事一覧</h2>
    <Stack>
      {summaries.map((summary) => <ArticleCard summary={summary} />)}
    </Stack>
  </Container>
</Document>

```

**MUI**で言うところの**Stack**のようなレイアウト用のコンポーネントは以下の通りです。

```tsx
---
interface Props {
  gap?: number;
}

const { gap = 1 } = Astro.props;
const vars = {
  gap: `${gap}rem`,
};
---

<!-- HTML -->
<div class="stack">
  <slot />
</div>

<!-- CSS -->
<style define:vars={vars}>
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }
</style>

```

`---`で囲まれた Markdown の frontmatter のような部分はサーバーサイドで実行されるコードで、**TypeScript**のように書けます。その下に**HTML**や**CSS**を書いていく感じですね。

デフォルトでは**CSS**は**スコープ**されるので、**CSS Modules**のような感じです。**props** で渡された値を使って**CSS**を変更することもできます。

## まとめ

今回は Next.js から Astro に刷新した理由と変更点をまとめました。

- **SPA** である必要がない
- **ビルド時間** の問題
- Astro の**コンテンツファースト**な設計
- **Jamstack** から **Markdown + SSG** への移行
- **Astro Island**による**JavaScript の最適化**
- Astro の**コード可読性** が高い

Astro はコンテンツファーストなフレームワークであり、**静的な HTML** に変換され、**JavaScript** は**コンポーネント単位**で必要に応じて読み込まれます。また、**コードの可読性**も高く、**Vue**や**Svelte**と似たような感じで書けます。

ユースケースによりますがブログやコーポレートサイトの開発は**Astro**、複雑なアプリケーションの開発は**Next.js**を使って行こうと思います。

それではまた次回 👋
