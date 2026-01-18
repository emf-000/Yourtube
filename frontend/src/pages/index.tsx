import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex-1 p-3 sm:p-4">
      <CategoryTabs />

      <Suspense
        fallback={
          <div className="text-sm sm:text-base text-center mt-4">
            Loading videos...
          </div>
        }
      >
        <Videogrid />
      </Suspense>
    </main>
  );
}
