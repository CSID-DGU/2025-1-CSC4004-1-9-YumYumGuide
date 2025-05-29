// app/search/[query]/page.tsx
'use client';


import { useRouter } from "next/navigation"
import { useState, useEffect, use } from "react";
import axios from 'axios';

type SearchResult = 
    {
    "restaurants": any[],
    "attractions": any[],
    "totalCount": {
        "restaurants": number;
        "attractions": number;
    },
    "searchInfo": {
        "query": string;
        "region": string;
        "searchTime": number;
    }
}


export default function SearchResultPage({ params }: { params: Promise<{ query: string }>}) {
    const router = useRouter();
    const [results, setResults] = useState<SearchResult | null>(null);
    const { query } = use(params)

    useEffect(()=>{
        const fetchData = async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
                            "query": decodeURIComponent(query),
                            "region": "asakusa"});

                setResults(response.data)
                
            }
            catch (error ) {console.error("에러야 에러")}
        }
        fetchData();
    },[])

    useEffect(() => {console.log(results)}, [results])

    return (<>
        {results ? results.restaurants.map((e,i,a)=>  
            (<div>
                <h1>식당이름: {e.data.restaurant_name}</h1>
                <p>종류: {e.data.genre}</p>
            </div>)
        ) : "로딩 중이거나 식당 검색결과가 없거나" }

        {results ? results.attractions.map((e,i,a)=>  
            (<div>
                <h1>관광지 이름: {e.data.attraction}</h1>
                <p>설명: {e.data.description}</p>
                <br />
            </div>)
        ) : "로딩 중이거나 관광지 검색결과가 없거나" }
    
    </>)

}