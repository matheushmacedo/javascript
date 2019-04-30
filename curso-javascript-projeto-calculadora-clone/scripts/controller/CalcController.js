class CalcController {

    constructor(){
        // quando o atributo tiver _ antes do nome signif que é privado (private)
        
        // querySelector é igual getElementById
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        // ate aqui so selecionei os itens
        
        this._currentDate; 
        this.initialize();
        this.initButtonsEvents();
        this.initKeyBoard();
    }

    // tudo que acontece quando chamar o metodo passara por aqui
    // pq esta chamando no construtor
    initialize(){
        this.setDisplayDateTime();
        setInterval(()=>{
            this.setDisplayDateTime();    
        },1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        // procura no documento por .btn-ac e forEach "ParaCada" faz alguma coisa  
        document.querySelectorAll('.btn-ac').forEach(btn=>{

            // aqui ja eh cada evento separado
            // faca alguma coisa quando der "dblclick" duplo clique 
            btn.addEventListener('dblclick', e=>{

                this.toggleAudio();

            });

        });
    }

    // interruptor do audio.. verif se esta ligado 
    // se tiver ligado, ao dar duplo clique ele desliga e vice versa
    toggleAudio(){

        // como ele so eh true ou false a cada interacao, se ele esta ligado eu quero desligar
        // e se esta desligado eu quero ligar
        // entao eh so fazer ele = ele negado (pq o valor dentro dele eh true ou false)
        this._audioOnOff = !this._audioOnOff;

    }

    // toca o audio que esta definido la no construtor
    playAudio(){

        if(this._audioOnOff){
            // faz isso pq o som tem um tempo e se eu clicar rapido em outro botao e o som
            // ainda nao tiver sido encerrado ai da um bug
            // com isso eu antes de chamar o audio jogo o currentTime dele pra 0
            this._audio.currentTime = 0;
            this._audio.play();
        }

    }

    copyToClipBoard(){
        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();
    }

    pasteFromClipboard(){

        document.addEventListener('paste', e=>{

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);
            //console.log('colar da calc', text);
        });

    }

    initKeyBoard(){

        document.addEventListener('keyup', e=>{
            
            this.playAudio();

            switch (e.key){

                case 'Escape':
                    this.clearAll();
                    break;
    
                case 'Backspace':
                    this.clearEntry();
                    break;    
    
                case '+':
                case '-':
                case '*':
                case '/':    
                case '%':
                    this.addOperation(e.key);
                    break;
                
                case 'Enter':
                case '=':
                    this.calc();
                    break;
    
                case 'ponto':
                case ',':
                    this.addDot();
                    break;
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    //console.log(value);
                    break;
    
                case 'c':
                    if(e.ctrlKey) this.copyToClipBoard();
                    break;
            }


        });

    }

    addEventListenerAll(element, events, fn){

        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });

    }

    // Limpa tudo
    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    // Limpa a ultima entrada da calculadora
    clearEntry(){
        this._operation.pop();
        this.setLastNumberToDisplay();
    }   

    // mostrar a msg error na calculadora
    setError(){
        this.displayCalc = "Error";
        //console.log(value);
    }

    getLastOperation() {
        // pega a ultima operacao para saber se eh um numero ou nao
        return this._operation[this._operation.length - 1];
    }

    isOperator(value){
        // pesquiso no value se tem algum dos operadores abaixo
        // eh como se fizesse um if, se encontrar algum returna true senao retorna false
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
    
    }

    setLastOperation(value){
        this._operation[this._operation.length - 1] = value;
    }

    getResult() {

        try {
            // o eval faz a conta em si
            return eval(this._operation.join(""));
            // aqui tem um array separado por virgula..
            // o join("") vazio, troca essas virgulas por vazio e junta os itens do array
        } catch(e){
            setTimeout(()=>{
                this.setError();
            }, 1);
            
        }
    }

    calc(){
        let last = '';
        
        // pego o ultimo operador
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){

            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        // se tem mais de 3 itens eu retino o ultimo para fazer a conta
        if(this._operation.length > 3){

            // retira a ultima operacao e guarda na variavel last
            last = this._operation.pop();

            // guardo o numero que foi calculado quando for + de 3 itens
            this._lastNumber = this.getResult();

        } else if(this._operation.length == 3){
            // guardo o ultimo numero que foi calculado quando for = a 3 itens
            this._lastNumber = this.getLastItem(false);
        }

        //console.log('_lastOperator', this._lastOperator);
        //console.log('_lastNumber', this._lastNumber);
        
        // o eval faz a conta em si
        let result = this.getResult();

        if(last == '%'){
            // se for porcentagem faz isso
            result /= 100;
            this._operation = [result];

        } else {

            this._operation = [result];

            if(last) this._operation.push(last);

        }
        this.setLastNumberToDisplay();
    }


    pushOperation(value){
        this._operation.push(value);

        if(this._operation.length > 3){

            this.calc();

            //console.log(this._operation);
        }
    }

    getLastItem(isOperator = true){
        let lastItem;

        for(let i = this._operation.length -1; i >= 0; i--){

            // se nao for um operador signif que achei um numero
            if(this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }

        }

        if(!lastItem){

            // if ternario (em uma linha)
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        }

        return lastItem;

    }

    setLastNumberToDisplay(){
        
        let lastNumber = this.getLastItem(false);

        /*
        for(let i = this._operation.length -1; i >= 0; i--){

            // se nao for um operador signif que achei um numero
            if(!this.isOperator(this._operation[i])){
                lastNumber = this._operation[i];
                break;
            }
        }
        */

        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

    }

    addDot(){

        let lastOperation = this.getLastOperation();

        // verif se dentro da lastOperation eh string 
        // e quebra ela com split e verifica se encontra algum . dentro dos itens
        // -1 signif que nao encontrou
        if(typeof lastOperation == 'string' && lastOperation.split('').indexOf('.' > -1)) return;

        

        if(this.isOperator(lastOperation) || !lastOperation){

            this.pushOperation('0.');

        } else {
            // pega a ultima operacao, transf em string e concatena com um ponto
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
        //console.log('lastOperation', lastOperation);

    }

    // add uma operação
    addOperation(value){

        //console.log('A', value, isNaN(this.getLastOperation()));
        // verifica se a ultima operacao eh um numero
        // o value aqui eh o valor do momento
        // this.getLastOperation() eh o valor anterior
        
        if(isNaN(this.getLastOperation())){
            // string
            //console.log('Entrou no string e pega a ultima string', this.getLastOperation());
            //console.log('Exibir o valor do value ', value);
            
            if(this.isOperator(value)){
                
                //console.log('Entrou no if pra ver se eh um operador', value);
                // trocar o operador para o atual
                this.setLastOperation(value);
            
            } else {
                // Quando cair aqui eh pq eh a primeira insercao
                // ainda nao tinha nada inserido para nao dar o erro na hora de buscar 
                // o ultimo operador
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }

        } else {
            // number

            if(this.isOperator(value)){

                this.pushOperation(value);

            } else {

                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);    

                // aqui preciso atualizar meu display
                this.setLastNumberToDisplay();
            }

            
        }

        //this._operation.push(value);
        //console.log(this._operation);
    }

    execBtn(value){

        this.playAudio();

        switch (value){

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;    

            case 'soma':
                this.addOperation('+');
                break;
                
            case 'subtracao':
            this.addOperation('-');
                break;   
                
            case 'divisao':
            this.addOperation('/');
                break;

            case 'multiplicacao':
            this.addOperation('*');
                break;

            case 'porcento':
            this.addOperation('%');
                break;

            case 'igual':
            this.calc();
                break;

            case 'ponto':
            this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                //console.log(value);
                break;

            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents() {
        // querySelectorAll busca no documento(página) todos que encontrar
        // querySelector busca somente o primeiro elemento que encontrar
        // na pesquisa a baixo (#buttons > g) significa, busque todas tags g que sao filhas do id buttons
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        
        // esse btn(parametro) eh o botao que esta recebendo a cada laço vindo da variavel buttons acima
        // pra passar so um parametro ficaria assim: buttons.forEach(btn=>{})
        // pra passar varios parametros tem que colocar parenteses neses, assim: buttons.forEach((btn, index)=>{})
        buttons.forEach((btn, index)=>{
            
            // addEventListener faz algo quando acontece o parametro que coloquei
            // neste caso quando alguem clicar (click) ou clicar e arrastar (drag)
            this.addEventListenerAll(btn, 'click drag', e => {
                // pra pegar o valor da classe usa className.baseVal
                // .replace substitui o que esta no primeiro parametro pelo segundo que passamos
                let textBtn = btn.className.baseVal.replace("btn-","");
               
                this.execBtn(textBtn);
            });

            // verifico se o mouse passou por cima do botao e mudo o cursor do mouse para a maozinha 
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });
    }

    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale);
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }  

    set displayDate(value){
        this._dateEl.innerHTML = value;
    } 

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){

        if(value.toString().length > 10){
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

}