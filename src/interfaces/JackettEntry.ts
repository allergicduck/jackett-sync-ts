export interface JackettEntry {
    id: string
    configured: string
    title: string
    description: string
    link: string
    language: string
    type: string
    caps: {
        categories: { category: CategoryEntry[] | CategoryEntry }
    }
}

export interface CategoryEntry {
    id: string
    name: string
    subcat?: CategoryEntry[] | CategoryEntry
}
