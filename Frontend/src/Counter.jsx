import { useState } from "react";

function App(){
    const[count,setCount]=useState(10);
    return(
        <div>
            <h1>{count}</h1>
            <button onClick={()=>setCount(count+1)}>Counter</button>
            {
                count==0?<h1>Condition 0</h1>
                :count==0?<h1>Condition 0</h1>
                :count==0?<h1>Condition 0</h1>
                :count==0?<h1>Condition 0</h1>
                :<h1>Other Condition 0</h1>
            }
        </div>
    )
}

export default App;