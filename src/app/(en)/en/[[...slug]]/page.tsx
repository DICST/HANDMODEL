import { staticParams, pageMetadata, renderRoute } from '@/lib/routes';

type Props = { params: Promise<{ slug?: string[] }> };
export const dynamicParams = false;
export const generateStaticParams = () => staticParams('en');
export const generateMetadata = ({ params }: Props) => pageMetadata('en', params);
export default function Page({ params }: Props) {
  return renderRoute('en', params);
}
