"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[200px] pt-0">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Welcome to <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Crypto Accounting
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Track, manage, and gain insights on all your crypto transactions in one place
            </p>
          </>
        }
      >
        <Image
          src="/dashboard-preview.png"
          alt="Crypto Accounting Dashboard"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
} 