import { SeatLayoutManager } from "@/features/admin/seats";

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