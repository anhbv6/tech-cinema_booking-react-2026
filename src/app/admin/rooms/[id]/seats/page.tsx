import { SeatLayoutManager } from "@/features/seats/components/seat-layout-manager";

type AdminRoomSeatsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRoomSeatsPage({
  params,
}: AdminRoomSeatsPageProps) {
  const { id } = await params;

  return <SeatLayoutManager roomId={id} />;
}