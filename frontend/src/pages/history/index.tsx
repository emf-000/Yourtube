import HistoryContent from "@/components/HistoryContent";
import React, { Suspense } from "react";

const index = () => {
  return (
    <main className="flex-1 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">
          Watch history
        </h1>

        <Suspense
          fallback={
            <div className="text-sm sm:text-base text-center">
              Loading...
            </div>
          }
        >
          <HistoryContent />
        </Suspense>
      </div>
    </main>
  );
};

export default index;
