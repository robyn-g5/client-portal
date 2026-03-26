import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function PropertyPage({ params }: Props) {
  const { propertyId } = await params
  redirect(`/properties/${propertyId}/listing-appointment`)
}
