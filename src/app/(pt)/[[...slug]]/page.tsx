import { staticParams, pageMetadata, renderRoute } from '@/lib/routes';

type Props = { params: Promise<{ slug?: string[] }> };
export const dynamicParams = false;
export const generateStaticParams = () => staticParams('pt');
export const generateMetadata = ({ params }: Props) => pageMetadata('pt', params);
export default function Page({ params }: Props) {
  return renderRoute('pt', params);
}
