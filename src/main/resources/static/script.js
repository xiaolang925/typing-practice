//内容字符池
const DIGITS='0123456789';   //数字池:键盘 0-9
const SYMBOLS="!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~\\"; //符号池：常见符号

const TARGET_LENGTH = 60;    //一行生成60字符

let target = '';             //当前要打的目标内容（一个字符串）
let cursor = 0;              //光标位置：正在打第几个字符（从0开始）
let mode='digits';           //当前难度:digits纯数字/symbols纯符号/mixed混合(当前默认digits)
let wrongChar = '';          //当前挂着的打错字，空字符串=没打错
let roundStart = 0;          //本局开始打字的时刻（第一次按键才记，0=还没开始
let roundResults = [];       //每完成一局，把成绩存进来（以后喂AI分析用）
let totalKeys = 0;           //这一局按了多少次“打字键”（对错都算）
let correctKeys = 0;         //这一局打对了多少次

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
        if(wrongChar !== ''&&i=== cursor){      //光标位置若挂着错字：显示打错的这个红字，顶替掉该打的字
            span.textContent = wrongChar;
            span.className = 'error';
        }else{
            span.textContent = target[i];   //否则显示该打的字
        }
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
        }else if(i===cursor&&wrongChar ===''){
            spans[i].classList.add('current');       //当前待打且没有错字->高亮(.current)
        }
    }
}

//处理一次按键
function handleKey(e) {
    //忽略带Ctrl/Alt/Meta的组合键，只处理普通字符
    if(e.ctrlKey ||e.metaKey||e.altKey)return;
    //如果挂着打错的字，只能按退格删掉它，其他键一律不管
    if(wrongChar!==''){
        if(e.key==='Backspace'){
            wrongChar='';
            render();
            statusEl.textContent = '删掉了，继续';
        }
        return;
    }
    if(e.key === 'Backspace')return; //没打错时，退格键不能删掉已经打对的字
    if(e.key.length!==1) return;   //只处理普通字符键
    if(cursor >= target.length)return;//打完就不处理了
    if(roundStart === 0)roundStart = Date.now();
    totalKeys++;
    if(e.key===target[cursor]){    //和题目当前要打的字符比一比
        correctKeys++;             //对了，对键数加1
        cursor++;                  //对了:光标前进一格
        updateHighlight();
        if(cursor===target.length){              //全部打完了，记录这局的成绩
            const timeMs=Date.now()-roundStart;  //用了多久
            const sec = (timeMs /1000).toFixed(1); //换算成秒，保留一位小数
            const cpm = Math.round(target.length / (timeMs/60000)); //每分钟多少字
            const accuracy = Math.round(correctKeys/totalKeys*100);  //准确率（百分数）
            roundResults.push({mode:mode,timeMs:timeMs,cpm:cpm,accuracy:accuracy,time:new Date().toISOString()});
            statusEl.textContent = '完成！用时 '+sec+' 秒 · CPM '+cpm+' ·准确率 '+accuracy+' %';
        }else{
            statusEl.textContent = "对了，继续";
        }
    }else{
        wrongChar = e.key;       //错了：把错误字亮出来
        render();
        statusEl.textContent = '打错了，按退格删掉';
    }
}
//重新开始：生成新题，光标归零，重画页面
function restart(){
    target = generateTarget();
    cursor = 0;
    wrongChar = '';     //换题时顺便清掉可能挂着的错误字
    roundStart = 0;     //新的一局，秒表归零
    totalKey = 0;       //按键计数归零
    correctKeys = 0;    //对键计数归零

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