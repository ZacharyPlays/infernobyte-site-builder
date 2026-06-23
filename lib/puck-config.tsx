"use client";
/* eslint-disable react/display-name */

import type { Config } from "@measured/puck";
import { BLOCKS } from "@/lib/blocks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PuckRender = (props: any) => React.ReactNode;

const PLACEHOLDER_HERO = "/img/placeholder-hero.svg";
const PLACEHOLDER_IMAGE = "/img/placeholder-image.svg";
const PLACEHOLDER_PRODUCT = "/img/placeholder-product.svg";

/**
 * Puck editor config for the in-site designer. Render functions reuse the same
 * runtime block components in lib/blocks.tsx so the editor preview and the
 * published page are guaranteed to match.
 */
export function createPuckConfig(primaryColor?: string): Config {
  const color = primaryColor || "#6366f1";
  const withColor =
    (name: string): PuckRender =>
    (props) => {
      const Comp = BLOCKS[name];
      if (!Comp) return null;
      return <Comp {...props} primaryColor={color} />;
    };

  return {
    categories: {
      layout: { title: "Layout", components: ["Navbar", "Footer"] },
      content: {
        title: "Content",
        components: ["Hero", "Text", "Image", "Features", "FAQ", "CTA", "Contact"],
      },
      commerce: { title: "Commerce", components: ["Pricing", "ProductGrid"] },
    },
    components: {
      Navbar: {
        label: "Navigation bar",
        fields: {
          siteName: { type: "text", label: "Site name" },
          links: { type: "text", label: "Links (comma-separated labels)" },
        },
        defaultProps: { siteName: "My Site", links: "Home,About,Contact" },
        render: withColor("Navbar"),
      },
      Hero: {
        label: "Hero banner",
        fields: {
          title: { type: "text", label: "Headline" },
          subtitle: { type: "textarea", label: "Subheadline" },
          buttonText: { type: "text", label: "Button text" },
          buttonLink: { type: "text", label: "Button link" },
          imageUrl: { type: "text", label: "Image URL" },
        },
        defaultProps: {
          title: "Welcome",
          subtitle: "Your tagline here",
          buttonText: "Learn more",
          buttonLink: "/",
          imageUrl: PLACEHOLDER_HERO,
        },
        render: withColor("Hero"),
      },
      Text: {
        label: "Text section",
        fields: {
          heading: { type: "text", label: "Heading" },
          body: { type: "textarea", label: "Body text" },
        },
        defaultProps: { heading: "Section title", body: "Your content here." },
        render: withColor("Text"),
      },
      Image: {
        label: "Image",
        fields: {
          src: { type: "text", label: "Image URL" },
          alt: { type: "text", label: "Alt text" },
          caption: { type: "text", label: "Caption" },
        },
        defaultProps: { src: PLACEHOLDER_IMAGE, alt: "", caption: "" },
        render: withColor("Image"),
      },
      Features: {
        label: "Features grid",
        fields: {
          heading: { type: "text", label: "Section heading" },
          item1Title: { type: "text", label: "Feature 1 title" },
          item1Text: { type: "textarea", label: "Feature 1 text" },
          item2Title: { type: "text", label: "Feature 2 title" },
          item2Text: { type: "textarea", label: "Feature 2 text" },
          item3Title: { type: "text", label: "Feature 3 title" },
          item3Text: { type: "textarea", label: "Feature 3 text" },
        },
        defaultProps: {
          heading: "Features",
          item1Title: "Feature one",
          item1Text: "Description",
          item2Title: "Feature two",
          item2Text: "Description",
          item3Title: "Feature three",
          item3Text: "Description",
        },
        render: withColor("Features"),
      },
      Pricing: {
        label: "Pricing",
        fields: {
          heading: { type: "text", label: "Section heading" },
          plan1Name: { type: "text", label: "Plan 1 name" },
          plan1Price: { type: "text", label: "Plan 1 price" },
          plan1Features: { type: "textarea", label: "Plan 1 features" },
          plan2Name: { type: "text", label: "Plan 2 name" },
          plan2Price: { type: "text", label: "Plan 2 price" },
          plan2Features: { type: "textarea", label: "Plan 2 features" },
        },
        defaultProps: {
          heading: "Pricing",
          plan1Name: "Basic",
          plan1Price: "$9/mo",
          plan1Features: "Feature A\nFeature B",
          plan2Name: "Pro",
          plan2Price: "$29/mo",
          plan2Features: "Everything in Basic\nPriority support",
        },
        render: withColor("Pricing"),
      },
      FAQ: {
        label: "FAQ",
        fields: {
          heading: { type: "text", label: "Section heading" },
          q1: { type: "text", label: "Question 1" },
          a1: { type: "textarea", label: "Answer 1" },
          q2: { type: "text", label: "Question 2" },
          a2: { type: "textarea", label: "Answer 2" },
          q3: { type: "text", label: "Question 3" },
          a3: { type: "textarea", label: "Answer 3" },
        },
        defaultProps: {
          heading: "FAQ",
          q1: "Question?",
          a1: "Answer.",
          q2: "",
          a2: "",
          q3: "",
          a3: "",
        },
        render: withColor("FAQ"),
      },
      CTA: {
        label: "Call to action",
        fields: {
          heading: { type: "text", label: "Heading" },
          text: { type: "textarea", label: "Text" },
          buttonText: { type: "text", label: "Button text" },
          buttonLink: { type: "text", label: "Button link" },
        },
        defaultProps: {
          heading: "Ready?",
          text: "Get started today.",
          buttonText: "Contact us",
          buttonLink: "/contact",
        },
        render: withColor("CTA"),
      },
      Contact: {
        label: "Contact info",
        fields: {
          heading: { type: "text", label: "Heading" },
          email: { type: "text", label: "Email" },
          phone: { type: "text", label: "Phone" },
          address: { type: "textarea", label: "Address" },
        },
        defaultProps: {
          heading: "Contact us",
          email: "hello@example.com",
          phone: "",
          address: "",
        },
        render: withColor("Contact"),
      },
      ProductGrid: {
        label: "Product grid",
        fields: {
          heading: { type: "text", label: "Section heading" },
          product1Name: { type: "text", label: "Product 1 name" },
          product1Price: { type: "text", label: "Product 1 price" },
          product1Image: { type: "text", label: "Product 1 image URL" },
          product2Name: { type: "text", label: "Product 2 name" },
          product2Price: { type: "text", label: "Product 2 price" },
          product2Image: { type: "text", label: "Product 2 image URL" },
          product3Name: { type: "text", label: "Product 3 name" },
          product3Price: { type: "text", label: "Product 3 price" },
          product3Image: { type: "text", label: "Product 3 image URL" },
        },
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
        render: withColor("ProductGrid"),
      },
      Footer: {
        label: "Footer",
        fields: {
          siteName: { type: "text", label: "Site name" },
          tagline: { type: "text", label: "Tagline" },
        },
        defaultProps: { siteName: "My Site", tagline: "" },
        render: withColor("Footer"),
      },
    },
  } as Config;
}
