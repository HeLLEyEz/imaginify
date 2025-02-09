/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */

import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER
export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};

// PLACEHOLDER LOADER - while image is transforming
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(
  shimmer(1000, 1000)
)}`;

// Types for URL query functions
interface FormUrlQueryParams {
  searchParams: URLSearchParams;
  key: string;
  value: string | number | boolean;
}

interface RemoveUrlQueryParams {
  searchParams: URLSearchParams;
  keysToRemove: string[];
}

// FORM URL QUERY
export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams): string => {
  // Convert URLSearchParams to a plain object
  const currentParams = Object.fromEntries(searchParams.entries());
  const updatedParams = { ...currentParams, [key]: value };

  return `${window.location.pathname}?${qs.stringify(updatedParams, {
    skipNulls: true,
  })}`;
};

// REMOVE KEY FROM QUERY
export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams): string {
  // Convert URLSearchParams to a plain object
  const currentParams = Object.fromEntries(searchParams.entries());

  keysToRemove.forEach((key) => {
    delete currentParams[key];
  });

  // Remove null or undefined values
  Object.keys(currentParams).forEach(
    (key) => currentParams[key] == null && delete currentParams[key]
  );

  return `${window.location.pathname}?${qs.stringify(currentParams)}`;
}

// DEBOUNCE
export const debounce = <T extends (...args: never[]) => void>(
  func: T,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout | null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Image interface for getImageSize
interface ImageDimensions {
  width?: number;
  height?: number;
  aspectRatio?: AspectRatioKey;
}

// GET IMAGE SIZE
export type AspectRatioKey = keyof typeof aspectRatioOptions;
export const getImageSize = (
  type: string,
  image: ImageDimensions,
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    return (
      aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] ||
      1000
    );
  }
  return image?.[dimension] || 1000;
};

// DOWNLOAD IMAGE
export const download = (url: string, filename: string): void => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;

      if (filename && filename.length)
        a.download = `${filename.replace(" ", "_")}.png`;
      document.body.appendChild(a);
      a.click();
    })
    .catch((error) => console.error({ error }));
};

// Types for deep merge
type DeepMergeable = { [key: string]: unknown } | null | undefined;

// DEEP MERGE OBJECTS
export const deepMergeObjects = <T extends DeepMergeable, U extends DeepMergeable>(
  obj1: T,
  obj2: U
): T & U => {
  if (obj2 === null || obj2 === undefined) {
    return obj1 as T & U;
  }

  const output = { ...obj2 } as { [key: string]: unknown };

  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      const value1 = obj1[key];
      const value2 = obj2?.[key];

      if (
        value1 &&
        typeof value1 === "object" &&
        value2 &&
        typeof value2 === "object"
      ) {
        output[key] = deepMergeObjects(
          value1 as DeepMergeable,
          value2 as DeepMergeable
        );
      } else {
        output[key] = value1;
      }
    }
  }

  return output as T & U;
};