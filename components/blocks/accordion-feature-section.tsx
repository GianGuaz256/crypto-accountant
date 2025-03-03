"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FeatureItem {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface Feature197Props {
  features: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  {
    id: 1,
    title: "No More Excel for Crypto Transactions",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
    description:
      "Stop struggling with complex Excel spreadsheets to track your crypto transactions. Our platform automatically imports and organizes all your transaction data in one centralized location, saving you hours of manual work.",
  },
  {
    id: 2,
    title: "Multi-Wallet Transaction Monitoring",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
    description:
      "View transactions from all your wallets in a single dashboard. No more switching between multiple tools and services to get a complete picture of your crypto activity. Perfect for individuals managing multiple addresses or organizations tracking multiple accounts.",
  },
  {
    id: 3,
    title: "AI-Powered Transaction Labeling",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
    description:
      "Our AI technology automatically analyzes and categorizes your transactions with accurate labels and descriptions. Stop wasting time manually entering details for each transaction. The system learns from your patterns to provide increasingly accurate categorizations.",
  },
  {
    id: 4,
    title: "Accountant-Friendly Reporting",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
    description:
      "Generate professional, structured reports that accountants and lawyers can easily understand. Export clean, organized transaction histories in multiple formats including PDF. Save time and avoid miscommunication when working with financial professionals.",
  },
  {
    id: 5,
    title: "Privacy-Focused Design",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
    description:
      "All your data is stored locally in your browser. We never store your wallet keys or sensitive financial data on our servers. Get all the benefits of powerful crypto accounting tools without compromising your security or privacy.",
  },
];

const Feature197 = ({ features = defaultFeatures }: Feature197Props) => {
  const [activeTabId, setActiveTabId] = useState<number | null>(1);
  const [activeImage, setActiveImage] = useState(features[0].image);

  return (
    <section className="pt-0 pb-20">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <h1 className="max-w-2xl text-4xl md:text-[4rem] font-bold leading-none">
            Problems We Solve
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our crypto accounting app addresses the key challenges faced by crypto investors and businesses
          </p>
        </div>
        <div className="mx-auto max-w-screen-xl">
          <div className="flex w-full items-stretch justify-between gap-12 min-h-[500px]">
            <div className="w-full md:w-1/2 flex flex-col">
              <Accordion type="single" className="w-full flex-grow" defaultValue="item-1">
                {features.map((tab) => (
                  <AccordionItem key={tab.id} value={`item-${tab.id}`}>
                    <AccordionTrigger
                      onClick={() => {
                        setActiveImage(tab.image);
                        setActiveTabId(tab.id);
                      }}
                      className="cursor-pointer py-5 !no-underline transition"
                    >
                      <h6
                        className={`text-xl font-semibold ${tab.id === activeTabId ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {tab.title}
                      </h6>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="mt-3 text-muted-foreground lg:text-lg">
                        {tab.description}
                      </p>
                      <div className="mt-4 md:hidden">
                        <img
                          src={tab.image}
                          alt={tab.title}
                          className="h-[300px] w-full object-cover border-2 border-[#6C6C6C]"
                          style={{ objectPosition: 'center' }}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="relative hidden md:block w-1/2 overflow-hidden">
              <img
                src={activeImage}
                alt="Feature preview"
                className="w-full h-[500px] object-cover border-2 border-[#6C6C6C]"
                style={{ objectPosition: 'center' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature197 }; 