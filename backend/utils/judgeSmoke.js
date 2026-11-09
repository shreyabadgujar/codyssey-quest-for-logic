require("dotenv").config();
const assert = require("node:assert/strict");
const { evaluate } = require("../services/evaluationService");
const { getClient } = require("../services/judge0Service");
// These programs execute only inside Judge0, never on the application server.
const solutions = {
  c: '#include <stdio.h>\nint main(void){int a,b;if(scanf("%d%d",&a,&b)!=2)return 1;printf("%d\\n",a+b);return 0;}',
  cpp: '#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}',
  java: 'import java.util.*; public class Main { public static void main(String[] args) { Scanner s=new Scanner(System.in); System.out.println(s.nextInt()+s.nextInt()); }}',
  python: 'a,b=map(int,input().split()); print(a+b)',
};
(async () => {
  const execute = getClient().execute;
  for (const [language, code] of Object.entries(solutions)) {
    const result = await evaluate({ language, code, execute, tests: [{ input: "2 3\n", expectedOutput: "5\n" }] });
    assert.equal(result.verdict, "Accepted", `${language}: ${result.verdict}`);
    console.log(`${language}: Accepted`);
  }
  const cases = [
    ["python", 'print("wrong")', "Wrong Answer"],
    ["cpp", "int main( {", "Compilation Error"],
    ["python", 'raise RuntimeError("smoke")', "Runtime Error"],
    ["python", "while True: pass", "Time Limit Exceeded"],
  ];
  for (const [language, code, verdict] of cases) {
    const result = await evaluate({ language, code, execute, tests: [{ input: "", expectedOutput: "5" }] });
    assert.equal(result.verdict, verdict, `${language}: ${result.verdict}`);
    console.log(verdict);
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
