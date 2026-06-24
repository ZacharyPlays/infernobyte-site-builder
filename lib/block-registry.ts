// Framework-agnostic block registry for the custom site builder.
// Each block describes its editable fields and default props. The visual
// components live in lib/blocks.tsx and are reused for both the live preview
// and the published page, so what the owner sees is exactly what ships.

export type FieldType = "text" | "textarea";

export type BlockField = {
  name: string;
  label: string;
  type: FieldType;
};

export type BlockCategory = "layout" | "content" | "commerce";

export type BlockDefinition = {
  type: string;
  label: string;
  category: BlockCategory;
  fields: BlockField[];
  defaultProps: Record<string, unknown>;
};

const PLACEHOLDER_HERO = "/img/placeholder-hero.svg";
const PLACEHOLDER_IMAGE = "/img/placeholder-image.svg";
const PLACEHOLDER_PRODUCT = "/img/placeholder-product.svg";

export const CATEGORY_LABELS: Record<BlockCategory, string> = {
  layout: "Layout",
  content: "Content",
  commerce: "Commerce",
};

export const CATEGORY_ORDER: BlockCategory[] = ["layout", "content", "commerce"];

export const BLOCK_REGISTRY: BlockDefinition[] = [
  {
    type: "Navbar",
    label: "Navigation bar",
    category: "layout",
    fields: [
      { name: "siteName", label: "Site name", type: "text" },
      { name: "links", label: "Links (comma-separated labels)", type: "text" },
    ],
    defaultProps: { siteName: "My Site", links: "Home,About,Contact" },
  },
  {
    type: "Hero",
    label: "Hero banner",
    category: "content",
    fields: [
      { name: "title", label: "Headline", type: "text" },
      { name: "subtitle", label: "Subheadline", type: "textarea" },
      { name: "buttonText", label: "Button text", type: "text" },
      { name: "buttonLink", label: "Button link", type: "text" },
      { name: "imageUrl", label: "Image URL", type: "text" },
    ],
    defaultProps: {
      title: "Welcome",
      subtitle: "Your tagline here",
      buttonText: "Learn more",
      buttonLink: "/",
      imageUrl: PLACEHOLDER_HERO,
    },
  },
  {
    type: "Text",
    label: "Text section",
    category: "content",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "body", label: "Body text", type: "textarea" },
    ],
    defaultProps: { heading: "Section title", body: "Your content here." },
  },
  {
    type: "Image",
    label: "Image",
    category: "content",
    fields: [
      { name: "src", label: "Image URL", type: "text" },
      { name: "alt", label: "Alt text", type: "text" },
      { name: "caption", label: "Caption", type: "text" },
    ],
    defaultProps: { src: PLACEHOLDER_IMAGE, alt: "", caption: "" },
  },
  {
    type: "Features",
    label: "Features grid",
    category: "content",
    fields: [
      { name: "heading", label: "Section heading", type: "text" },
      { name: "item1Title", label: "Feature 1 title", type: "text" },
      { name: "item1Text", label: "Feature 1 text", type: "textarea" },
      { name: "item2Title", label: "Feature 2 title", type: "text" },
      { name: "item2Text", label: "Feature 2 text", type: "textarea" },
      { name: "item3Title", label: "Feature 3 title", type: "text" },
      { name: "item3Text", label: "Feature 3 text", type: "textarea" },
    ],
    defaultProps: {
      heading: "Features",
      item1Title: "Feature one",
      item1Text: "Description",
      item2Title: "Feature two",
      item2Text: "Description",
      item3Title: "Feature three",
      item3Text: "Description",
    },
  },
  {
    type: "FAQ",
    label: "FAQ",
    category: "content",
    fields: [
      { name: "heading", label: "Section heading", type: "text" },
      { name: "q1", label: "Question 1", type: "text" },
      { name: "a1", label: "Answer 1", type: "textarea" },
      { name: "q2", label: "Question 2", type: "text" },
      { name: "a2", label: "Answer 2", type: "textarea" },
      { name: "q3", label: "Question 3", type: "text" },
      { name: "a3", label: "Answer 3", type: "textarea" },
    ],
    defaultProps: {
      heading: "FAQ",
      q1: "Question?",
      a1: "Answer.",
      q2: "",
      a2: "",
      q3: "",
      a3: "",
    },
  },
  {
    type: "CTA",
    label: "Call to action",
    category: "content",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "text", label: "Text", type: "textarea" },
      { name: "buttonText", label: "Button text", type: "text" },
      { name: "buttonLink", label: "Button link", type: "text" },
    ],
    defaultProps: {
      heading: "Ready?",
      text: "Get started today.",
      buttonText: "Contact us",
      buttonLink: "/contact",
    },
  },
  {
    type: "Contact",
    label: "Contact info",
    category: "content",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "address", label: "Address", type: "textarea" },
    ],
    defaultProps: {
      heading: "Contact us",
      email: "hello@example.com",
      phone: "",
      address: "",
    },
  },
  {
    type: "Pricing",
    label: "Pricing",
    category: "commerce",
    fields: [
      { name: "heading", label: "Section heading", type: "text" },
      { name: "plan1Name", label: "Plan 1 name", type: "text" },
      { name: "plan1Price", label: "Plan 1 price", type: "text" },
      { name: "plan1Features", label: "Plan 1 features", type: "textarea" },
      { name: "plan2Name", label: "Plan 2 name", type: "text" },
      { name: "plan2Price", label: "Plan 2 price", type: "text" },
      { name: "plan2Features", label: "Plan 2 features", type: "textarea" },
    ],
    defaultProps: {
      heading: "Pricing",
      plan1Name: "Basic",
      plan1Price: "$9/mo",
      plan1Features: "Feature A\nFeature B",
      plan2Name: "Pro",
      plan2Price: "$29/mo",
      plan2Features: "Everything in Basic\nPriority support",
    },
  },
  {
    type: "ProductGrid",
    label: "Product grid",
    category: "commerce",
    fields: [
      { name: "heading", label: "Section heading", type: "text" },
      { name: "product1Name", label: "Product 1 name", type: "text" },
      { name: "product1Price", label: "Product 1 price", type: "text" },
      { name: "product1Image", label: "Product 1 image URL", type: "text" },
      { name: "product2Name", label: "Product 2 name", type: "text" },
      { name: "product2Price", label: "Product 2 price", type: "text" },
      { name: "product2Image", label: "Product 2 image URL", type: "text" },
      { name: "product3Name", label: "Product 3 name", type: "text" },
      { name: "product3Price", label: "Product 3 price", type: "text" },
      { name: "product3Image", label: "Product 3 image URL", type: "text" },
    ],
    defaultProps: {
      heading: "Products",
      product1Name: "Item 1",
      product1Price: "19.99",
      product1Image: PLACEHOLDER_PRODUCT,
      product2Name: "",
      product2Price: "",
      product2Image: "",
      product3Name: "",
      product3Price: "",
      product3Image: "",
    },
  },
  {
    type: "Footer",
    label: "Footer",
    category: "layout",
    fields: [
      { name: "siteName", label: "Site name", type: "text" },
      { name: "tagline", label: "Tagline", type: "text" },
    ],
    defaultProps: { siteName: "My Site", tagline: "" },
  },
];

export const BLOCK_MAP: Record<string, BlockDefinition> = Object.fromEntries(
  BLOCK_REGISTRY.map((b) => [b.type, b]),
);

export function blocksByCategory(): Record<BlockCategory, BlockDefinition[]> {
  const grouped: Record<BlockCategory, BlockDefinition[]> = {
    layout: [],
    content: [],
    commerce: [],
  };
  for (const block of BLOCK_REGISTRY) {
    grouped[block.category].push(block);
  }
  return grouped;
}

export function createBlock(type: string): { type: string; props: Record<string, unknown> } | null {
  const def = BLOCK_MAP[type];
  if (!def) return null;
  return { type, props: { ...def.defaultProps } };
}
