"use client";
import React from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white dark:bg-black p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export function ServiceFeatures() {
  const features = [
    {
      icon: "📊",
      title: "Transaction Tracking",
      description: "Automatically fetch and organize all your crypto transactions in one place."
    },
    {
      icon: "🏷️",
      title: "Smart Labeling",
      description: "AI-powered suggestions to help you categorize and label your transactions."
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Access your financial data on any device, anywhere, anytime."
    },
    {
      icon: "🔒",
      title: "Privacy First",
      description: "Your data never leaves your device. We use local storage for maximum privacy."
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Manage your crypto finances with powerful tools designed for simplicity and insight
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 