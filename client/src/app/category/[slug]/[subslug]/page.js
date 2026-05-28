import SubCategoryContent from "./SubCategoryContent";

export default function SubCategoryPage({ params }) {
    return <SubCategoryContent catSlug={params.slug} subSlug={params.subslug} />;
}
