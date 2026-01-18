import SearchResult from "@/components/SearchResult";
import { useRouter } from "next/router";
import React, { Suspense } from "react";

const index = () => {
  const router = useRouter();
  const { q } = router.query;

  return (
    <div className="flex-1 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {q && (
          <div className="mb-4 sm:mb-6">
            <h1 className="text-base sm:text-xl font-medium mb-3 sm:mb-4">
              Search results for "{q}"
            </h1>
          </div>
        )}

        <Suspense
          fallback={
            <div className="text-sm sm:text-base text-center">
              Loading search results...
            </div>
          }
        >
          <SearchResult query={q || ""} />
        </Suspense>
      </div>
    </div>
  );
};

export default index;
