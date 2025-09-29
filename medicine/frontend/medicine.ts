export interface Medicine {
    item_name: string,
    detail: string,
    source_file: string[],
    category?: string, //백엔드에 없을 땐 빈 문자열
}

export async function searchMedicine(query: string): Promise<Medicine[]> {
    if (!query.trim()) return []

    const res = await fetch(`http://127.0.0.1:8000/search/?item_name=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error(`Search API error : ${res.statusText}`);

    const json = await res.json();

    //json이 Array인지, 혹은 { results: Array } 형태인지 둘 다 안전하게 처리
    const rawArr = Array.isArray(json) ? json : (Array.isArray(json.results) ? json.results : []);

    //map 해서 우리가 기대하는 shape로 맞춤
    return rawArr.map((m: any) => ({
        item_name: m.item_name ?? m.name ?? '',
        detail: m.detail ?? '',
        source_file: m.source_file ?? [],
        category: m.category ?? '',
    }));
}