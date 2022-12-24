import express from "express";
import fetch from 'node-fetch';
import CircuitBreaker from 'opossum';
const app = express();
const app2 = express();
async function asyncFunctionThatCouldFail() {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3001/')
        .then(res => res.json())
        .then(json => {
            resolve(json)
    }).catch(err => reject(err))
  });
}
const options = {
  timeout: 100, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 10000 // After 30 seconds, try again.
};
const breaker = new CircuitBreaker(asyncFunctionThatCouldFail, options);

 
app.get("/", async (req, response) => {

  breaker.fire()
  .then(res => response.json(res))
  .catch(err => response.status(500).json(err));
});
 
app2.get("/", (req, res) => {
    const randomNumber = Math.round(Math.random() * 10)
    console.log(randomNumber)
  if (randomNumber <= 5) {
    res.status(200).json({msg:"Success!"});
  } else {
    setTimeout(()=>{
        res.status(400).json({msg:"Failed!"});
    },150)
    
  }
});

app.listen(3000, () => console.log(`Listening at http://localhost:3000`));
app2.listen(3001, () => console.log(`Listening at http://localhost:3001`));

breaker.on('open',()=>{
    console.log('circuit has opened')
})

breaker.on('halfOpen',()=>{
    console.log('circuit has halfOpened')
})

breaker.on('close',()=>{
    console.log('circuit has closed')
})