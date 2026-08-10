import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
          <div className="h-5 w-full bg-gray-200 rounded mb-2" />
          <div className="h-5 w-2/3 bg-gray-200 rounded" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-4 w-1/3 bg-gray-200 rounded ml-auto" />
          <div className="h-7 w-2/5 bg-gray-200 rounded ml-auto" />
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
