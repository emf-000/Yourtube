import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setvideo(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, []);

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        gap-3 sm:gap-4
        px-2 sm:px-0
      "
    >
      {loading ? (
        <div className="col-span-full text-center text-sm sm:text-base">
          Loading...
        </div>
      ) : (
        videos.map((video: any) => (
          <Videocard key={video._id} video={video} />
        ))
      )}
    </div>
  );
};

export default Videogrid;
