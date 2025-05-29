// app/search/[query]/page.tsx
'use client';


import { useRouter } from "next/navigation"
import { useState, useEffect, use } from "react";
import SearchResultCard from "../components/searchResultCard"
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

    return (<>
        {results ? results.restaurants.map((e,i,a)=>  
            (<div>
                <SearchResultCard key={e.data._id} title={e.data.restaurant_name} type="식당" description={e.data.genre} price={e.data.budget} recommended={true} onDetailClick={e.data._id}/>
                <br />
            </div>)
        ) : "로딩 중이거나 식당 검색결과가 없거나" }

        {results ? results.attractions.map((e,i,a)=>  
            (<div>
                <SearchResultCard key={e.data._id} title={e.data.attraction} type="관광" description={e.data.description} price={e.data.address} recommended={true} onDetailClick={e.data._id}/>
                <br />
            </div>)
        ) : "로딩 중이거나 관광지 검색결과가 없거나" }
    
    </>)

}