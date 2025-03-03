import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Layout, Pointer, Zap } from "lucide-react";
import { useRouter } from 'next/navigation';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonAction?: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const Feature108 = ({
  badge = "My Crypto Accounting App",
  heading = "Track Your Crypto Transactions With Ease",
  description = "Connect your wallet, organize your transactions, and get insights - all in one place.",
  tabs = [
    {
      value: "tab-1",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Connect Wallet",
      content: {
        badge: "Easy Setup",
        title: "Connect your Ethereum wallet in seconds.",
        description:
          "Simply connect your wallet to get started. We'll automatically fetch your transaction history and organize it for you. No complicated setup required.",
        buttonText: "Connect Wallet",
        buttonAction: "/wallet",
        imageSrc:
          "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
        imageAlt: "Ethereum wallet connection",
      },
    },
    {
      value: "tab-2",
      icon: <Pointer className="h-auto w-4 shrink-0" />,
      label: "Track Transactions",
      content: {
        badge: "Powerful Features",
        title: "Organize and categorize your crypto activity.",
        description:
          "View your complete transaction history, label transactions, add notes, and categorize them for better organization. Perfect for tax preparation and financial tracking.",
        buttonText: "View Features",
        buttonAction: "/transactions",
        imageSrc:
          "https://images.unsplash.com/photo-1621501103258-d0882c0cd353?q=80&w=2070&auto=format&fit=crop",
        imageAlt: "Transaction tracking",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "AI Insights",
      content: {
        badge: "Smart Analysis",
        title: "Get AI-powered insights for better decisions.",
        description:
          "Our AI technology analyzes your transaction patterns and provides personalized insights and suggestions to help you make better financial decisions with your crypto assets.",
        buttonText: "Learn More",
        buttonAction: "/insights",
        imageSrc:
          "https://images.unsplash.com/photo-1634711853733-b831e7ccef7d?q=80&w=1974&auto=format&fit=crop",
        imageAlt: "AI insights for crypto",
      },
    },
  ],
}: Feature108Props) => {
  const router = useRouter();
  
  const handleButtonClick = (path: string) => {
    router.push(path);
  };
  
  return (
    <section className="pt-0 pb-20">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline">{badge}</Badge>
          <h1 className="max-w-2xl text-4xl md:text-[4rem] font-bold leading-none">
            {heading}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        <Tabs defaultValue={tabs[0].value} className="mt-8">
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl p-6 lg:p-16">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-20 lg:grid-cols-2 lg:gap-10"
              >
                <div className="flex flex-col gap-5">
                  <Badge variant="outline" className="w-fit bg-background">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-3xl font-semibold lg:text-5xl">
                    {tab.content.title}
                  </h3>
                  <p className="text-muted-foreground lg:text-lg">
                    {tab.content.description}
                  </p>
                  <Button 
                    className="mt-2.5 w-fit gap-2" 
                    size="lg"
                    onClick={() => tab.content.buttonAction && handleButtonClick(tab.content.buttonAction)}
                  >
                    {tab.content.buttonText}
                  </Button>
                </div>
                <img
                  src={tab.content.imageSrc}
                  alt={tab.content.imageAlt}
                  className="rounded-xl border-2 border-[#6C6C6C]"
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { Feature108 }; 