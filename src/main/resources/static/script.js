//内容字符池
const DIGITS='0123456789';   //数字池:键盘 0-9
const SYMBOLS="!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~\\"; //符号池：常见符号

const TARGET_LENGTH = 60;    //一行生成60字符

let target = '';             //当前要打的目标内容（一个字符串）
let cursor = 0;              //光标位置：正在打第几个字符（从0开始）
let mode='digits';           //当前难度:digits纯数字/symbols纯符号/mixed混合(当前默认digits)

//界面元素：用id找到页面上的三个家伙
const typingArea = document.getElementById('typing-area'); //打字区
const statusEl = document.getElementById('status');         //状态文字
const restartBtn = document.getElementById('restart-btn');  //重新生成按钮
const btnDigits = document.getElementById('btn-digits');    //难度按钮：纯数字
const btnSymbols = document.getElementById('btn-symbols');  //难度按钮：纯符号
const btnMixed = document.getElementById('btn-mixed');    //难度按钮：混合

//从pool里随机挑一个字符
function randomChar(pool){
    return pool[Math.floor(Math.random()*pool.length)];
}

//生成一行目标内容：根据当前难度决定从哪个池子抽
function generateTarget(){
    let result = '';
    for(let i=0;i<TARGET_LENGTH;i++){
        if(mode==='digits'){
            result += randomChar(DIGITS);   //纯数字
        }else if(mode==='symbols'){
            result += randomChar(SYMBOLS);  //纯符号
        }else{
            result +=Math.random()<0.5?randomChar(DIGITS):randomChar(SYMBOLS);  //混合：数字符号各半
        }
    }
    return result;
}

//把目标内容渲染成一个个span放进打字区
function render(){
    typingArea.innerHTML = ''; //先清空打字区
    for(let i=0;i<target.length;i++){
        const span = document.createElement('span');  //造一个span元素
        span.textContent = target[i];                 //放一个字符（用textContent防止XSS注入）
        typingArea.appendChild(span);
    }
    updateHighlight();
}

//更新高亮：光标前的字变灰，光标所在的字高亮
function updateHighlight(){
    const spans = typingArea.children;               //取出打字区里所有的span
    for(let i=0;i<spans.length;i++){
        spans[i].classList.remove('typed','current');  //先清理旧的类
        if(i<cursor){
            spans[i].classList.add('typed');          //已打过->变灰(.typed)            
        }else if(i===cursor){
            spans[i].classList.add('current');       //当前待打->高亮(.current)
        }
    }
}

//处理一次按键
function handleKey(e) {
    //忽略带Ctrl/Alt/Meta的组合键，只处理普通字符
    if(e.ctrlKey ||e.metaKey||e.altKey)return;
    if(e.key.length!==1) return;   //忽略退格，方向键等
    if(cursor >= target.length)return;//打完就不处理了
    if(e.key===target[cursor]){    //和题目当前要打的字符比一比
        cursor++;                  //对了:光标前进一格
        updateHighlight();
        statusEl.textContent = "对了，继续";
    }else{
        statusEl.textContent ="错了，应该是"+ target[cursor]; //错了先给个提示
    }
}
//重新开始：生成新题，光标归零，重画页面
function restart(){
    target = generateTarget();
    cursor = 0;
    statusEl.textContent = "开始吧";
    render();
}
//难度切换
//点按钮切换难度：换mode、换高亮、重新生成一题
function setMode(newMode){
    mode=newMode;
    //先把所有按钮高亮去掉，再单独点亮选中的那个
    btnDigits.classList.remove('selected');
    btnSymbols.classList.remove('selected');
    btnMixed.classList.remove('selected');
    if(mode==='digits'){
        btnDigits.classList.add('selected');
    }else if(mode === 'symbols'){
        btnSymbols.classList.add('selected');
    }else{
        btnMixed.classList.add('selected');
    }
    restart();
}
//三个难度按钮：点哪个就切到哪个难度
btnDigits.addEventListener('click',function() { setMode('digits');});
btnSymbols.addEventListener('click',function(){ setMode('symbols');});
btnMixed.addEventListener('click',function(){ setMode('mixed');});

//把事件连起来：
//1.打字区收到按键->交给handleKey
typingArea.addEventListener('keydown',handleKey);
//2.点按钮->重新开始
restartBtn.addEventListener('click',restart);
//3.打开页面时自动生成第一道题
restart();