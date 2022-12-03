export interface Summary {
  href: string;
  title: string;
  description: string;
  category: Array<string>;
  createdAt: string;
  updatedAt: string;
  draft: boolean;
}

export interface Article extends Summary {
  content: any;
}
