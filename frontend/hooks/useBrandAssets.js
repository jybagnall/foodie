import { useQuery } from "@tanstack/react-query";
import BrandService from "../services/brand.service";

export default function useBrandAssets() {
  const { data: assets = {} } = useQuery({
    queryKey: ["brand-settings"],
    queryFn: ({ signal }) => new BrandService(signal).getBrandAssets(),
    staleTime: Infinity, // 직접 갱신하기 전까지 캐시를 씀
  });

  return {
    assets,
  };
}
