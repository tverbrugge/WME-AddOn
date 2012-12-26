function autoCompleteDB() {
    this.aNames = new Array();
}

autoCompleteDB.prototype.assignArray = function(aList) {
    this.aNames = aList;
};

autoCompleteDB.prototype.getMatches = function(str, aList, maxSize) {
    /* debug */ //alert(maxSize+"ok getmatches");
    var ctr = 0;
    for (var i in this.aNames) {
        /*looking for case insensitive matches */
        if (this.aNames[i].toLowerCase().indexOf(str.toLowerCase()) == 0) {
            aList.push(this.aNames[i]);
            ctr++;
        }
        /* counter to limit no of matches to maxSize */
        if (ctr == (maxSize - 1)) {
            break;
        }

    }
};

function autoComplete(aNames, oText, oDiv, maxSize) {

    this.oText = oText;
    this.oDiv = oDiv;
    this.maxSize = maxSize;
    this.cur = -1;

    /*debug here */
    //alert(oText+","+this.oDiv);

    this.db = new autoCompleteDB();
    this.db.assignArray(aNames);

    oText.onkeyup = this.keyUp;
    oText.onkeydown = this.keyDown;
    oText.autoComplete = this;
    oText.onblur = this.hideSuggest;
}

autoComplete.prototype.hideSuggest = function() {
    this.autoComplete.oDiv.style.visibility = "hidden";
};

autoComplete.prototype.selectText = function(iStart, iEnd) {
    /* For Mozilla */
    if (this.oText.setSelectionRange) {
        this.oText.setSelectionRange(iStart, iEnd);
    }
    this.oText.focus();
};

autoComplete.prototype.textComplete = function(sFirstMatch) {
    if (this.oText.createTextRange || this.oText.setSelectionRange) {
        var iStart = this.oText.value.length;
        this.oText.value = sFirstMatch;
        this.selectText(iStart, sFirstMatch.length);
    }
};

autoComplete.prototype.keyDown = function(oEvent) {
    oEvent = window.event || oEvent;
    iKeyCode = oEvent.keyCode;

    switch(iKeyCode) {
        case 38:
            //up arrow
            this.autoComplete.moveUp();
            break;
        case 40:
            //down arrow
            this.autoComplete.moveDown();
            break;
        case 13:
            //return key
            window.focus();
            break;
    }
};

autoComplete.prototype.moveDown = function() {
    if (this.oDiv.childNodes.length > 0 && this.cur < (this.oDiv.childNodes.length - 1)) {++this.cur;
        for (var i = 0; i < this.oDiv.childNodes.length; i++) {
            if (i == this.cur) {
                this.oDiv.childNodes[i].className = "over";
                this.oText.value = this.oDiv.childNodes[i].innerHTML;
            } else {
                this.oDiv.childNodes[i].className = "";
            }
        }
    }
};

autoComplete.prototype.moveUp = function() {
    if (this.oDiv.childNodes.length > 0 && this.cur > 0) {--this.cur;
        for (var i = 0; i < this.oDiv.childNodes.length; i++) {
            if (i == this.cur) {
                this.oDiv.childNodes[i].className = "over";
                this.oText.value = this.oDiv.childNodes[i].innerHTML;
            } else {
                this.oDiv.childNodes[i].className = "";
            }
        }
    }
};

autoComplete.prototype.keyUp = function(oEvent) {
    oEvent = oEvent || window.event;
    var iKeyCode = oEvent.keyCode;
    if (iKeyCode == 8 || iKeyCode == 46) {
        this.autoComplete.onTextChange(false);
        /* without autocomplete */
    } else if (iKeyCode < 32 || (iKeyCode >= 33 && iKeyCode <= 46) || (iKeyCode >= 112 && iKeyCode <= 123)) {
        //ignore
    } else {
        this.autoComplete.onTextChange(true);
        /* with autocomplete */
    }
};
/* to calculate the appropriate poistion of the dropdown */
autoComplete.prototype.positionSuggest = function() {
    var oNode = this.oText;
    var x = 0, y = oNode.offsetHeight;

    while (oNode.offsetParent && oNode.offsetParent.tagName.toUpperCase() != 'BODY') {
        x += oNode.offsetLeft;
        y += oNode.offsetTop;
        oNode = oNode.offsetParent;
    }

    x += oNode.offsetLeft;
    y += oNode.offsetTop;

    this.oDiv.style.top = y + "px";
    this.oDiv.style.left = x + "px";
}

autoComplete.prototype.onTextChange = function(bTextComplete) {
    var txt = this.oText.value;
    var oThis = this;
    this.cur = -1;

    if (txt.length > 0) {
        while (this.oDiv.hasChildNodes())
        this.oDiv.removeChild(this.oDiv.firstChild);

        var aStr = new Array();
        this.db.getMatches(txt, aStr, this.maxSize);
        if (!aStr.length) {
            this.hideSuggest
            return
        }
        if (bTextComplete)
            this.textComplete(aStr[0]);
        this.positionSuggest();

        for (i in aStr) {
            var oNew = document.createElement('div');
            this.oDiv.appendChild(oNew);
            oNew.onmouseover = oNew.onmouseout = oNew.onmousedown = function(oEvent) {
                oEvent = window.event || oEvent;
                oSrcDiv = oEvent.target || oEvent.srcElement;

                //debug :window.status=oEvent.type;
                if (oEvent.type == "mousedown") {
                    oThis.oText.value = this.innerHTML;
                } else if (oEvent.type == "mouseover") {
                    this.className = "over";
                } else if (oEvent.type == "mouseout") {
                    this.className = "";
                } else {
                    this.oText.focus();
                }
            };
            oNew.innerHTML = aStr[i];
        }

        this.oDiv.style.visibility = "visible";
    } else {
        this.oDiv.innerHTML = "";
        this.oDiv.style.visibility = "hidden";
    }
};

function createAutoComplete() {
    var aNames = ["Aaron", "Abbott", "Abdallah", "Abdul", "Abdullah", "Abe", "Abel", "Abiba", "Abie", "Abner", "Abraham", "Abram", "Absalom", "Abu", "Ace", "Ackeem", "Adair", "Adalberto", "Adam", "Adan", "Addison", "Ade", "Adem", "Aderes", "Adie", "Adiel", "Adita", "Adlai", "Adolf", "Adolfo", "Adolph", "Adonia", "Adonis", "Adrian", "Adrien", "Agustin", "Ahmad", "Ahmed", "Aidan", "Aiden", "Airen", "Aislinn", "Aj", "Ajani", "Ajay", "Akeem", "Akil", "Akuji", "Al", "Alain", "Alake", "Alan", "Alaric", "Alastair", "Alban", "Albany", "Albert", "Alberto", "Albeto", "Albin", "Albrecht", "Aldan", "Alden", "Aldo", "Aldon", "Aldora", "Aldous", "Alec", "Alejandro", "Alek", "Aleksander", "Alem", "Alen", "Alev", "Alex", "Alexander", "Alexei", "Alf", "Alfonso", "Alfonzo", "Alfred", "Alfredo", "Alijah", "Alisdair", "Allan", "Allen", "Alonso", "Alonzo", "Aloysius", "Alphonse", "Alphonso", "Alton", "Alva", "Alvaro", "Alvin", "Amadeo", "Amadeus", "Amado", "Amador", "Amalia", "Amalie", "Aman", "Amana", "Amandla", "Amari", "Ambrose", "America", "Americo", "Amerigo", "Amir", "Amiri", "Ammon", "Amon", "Amos", "Anana", "Ananda", "Anando", "Anaru", "Anastasios", "Anatole", "Anatoliy", "Ande", "Anderson", "Andre", "Andreas", "Andrej", "Andres", "Andrew", "Andy", "Anemone", "Anfernee", "Angelo", "Angus", "Anil", "Anin", "Anlon", "Anselm", "Anselmo", "Anson", "Antal", "Anthony", "Anton", "Antonio", "Anwar", "Aoko", "Apollo", "Aquil", "Aquila", "Aquilla", "Ara", "Aram", "Aramis", "Archer", "Archibald", "Archie", "Archy", "Arden", "Aric", "Aries", "Aristotelis", "Aristotle", "Ariza", "Arlan", "Arlen", "Arlo", "Arman", "Armand", "Armande", "Armando", "Armen", "Armin", "Armon", "Armondo", "Arnaud", "Arne", "Arnie", "Arnold", "Aron", "Arran", "Arron", "Art", "Artemis", "Arthur", "Artie", "Arty", "Arva", "Arvid", "Asa", "Asabi", "Asalie", "Asher", "Ashton", "Asis", "Asli", "Athalia", "Athanasius", "Athelstan", "Athelston", "Athol", "Atwell", "August", "Augustin", "Augustine", "Augustus", "Austin", "Avary", "Averil", "Averill", "Avery", "Avi", "Avongara", "Avram", "Ayame", "Ayoka", "Azelin", "Azize", "Azuka", "Azuriah", "Bahari", "Baird", "Bairn", "Baldwin", "Ballard", "Balthazar", "Banji", "Baptist", "Barak", "Barke", "Barnabas", "Barnabus", "Barnaby", "Barnard", "Barnett", "Barney", "Barny", "Baron", "Barrett", "Barry", "Bart", "Barth", "Bartholomew", "Barton", "Baruch", "Bary", "Bash", "Basil", "Bast", "Bastian", "Baxter", "Bayard", "Beat", "Beaty", "Beau", "Beauregard", "Beck", "Belay", "Belio", "Bell", "Bellamy", "Ben", "Benedict", "Benen", "Benito", "Benjamin", "Benjy", "Bennet", "Bennett", "Bennie", "Benny", "Benson", "Bentley", "Benton", "Berger", "Berke", "Berman", "Bern", "Bernard", "Berne", "Bernie", "Berny", "Bert", "Bertram", "Bertrand", "Bevan", "Beven", "Bevin", "Beyla", "Bidelia", "Bijean", "Bikita", "Bilen", "Bill", "Billy", "Bin", "Bina", "Bing", "Birch", "Bishop", "Biton", "Bjorn", "Blaine", "Blair", "Blaise", "Blake", "Blane", "Bliss", "Blythe", "Bo", "Bob", "Bobby", "Boden", "Bonaventure", "Bond", "Boniface", "Bonifacio", "Bono", "Boone", "Boris", "Bowen", "Bowie", "Brad", "Braden", "Bradford", "Bradley", "Bradshaw", "Brady", "Braeden", "Braedon", "Braima", "Braithe", "Bran", "Brand", "Branden", "Brandon", "Brant", "Braxton", "Brayden", "Brazil", "Brend", "Brendan", "Brendon", "Brendyn", "Brennan", "Brennon", "Brent", "Brenton", "Bret", "Brett", "Brewster", "Brian", "Briar", "Brice", "Brick", "Brighton", "Brilane", "Britt", "Britton", "Brock", "Broderick", "Brodie", "Brody", "Brogan", "Brone", "Bronson", "Brook", "Brooks", "Bruce", "Bruno", "Bryan", "Bryant", "Bryce", "Bryceton", "Bryn", "Brynn", "Bryon", "Bryson", "Bubba", "Buck", "Bud", "Buddie", "Buddy", "Buford", "Burgess", "Burke", "Burt", "Burton", "Buster", "Butch", "Butcher", "Butchie", "Byrne", "Byron", "Caddall", "Cade", "Cadell", "Caden", "Cael", "Caelan", "Caesar", "Cahal", "Cain", "Caine", "Cal", "Caleb", "Callum", "Calum", "Calvin", "Cam", "Camden", "Cameron", "Camlin", "Campbell", "Camron", "Carl", "Carleton", "Carlisle", "Carlo", "Carlos", "Carlton", "Carlyle", "Carmac", "Carmelo", "Carmine", "Carr", "Carrick", "Carson", "Carsten", "Carsyn", "Carter", "Carver", "Cary", "Cash", "Cashley", "Casimir", "Caspar", "Casper", "Caspian", "Cassius", "Cathal", "Cavan", "Cecil", "Cedric", "Cesar", "Chad", "Chance", "Chancellor", "Chandler", "Channing", "Chante", "Chantry", "Charl", "Charles", "Charli", "Charlie", "Charls", "Charlton", "Chars", "Chas", "Chase", "Chauncey", "Chaz", "Cheche", "Chen", "Chesley", "Chester", "Chet", "Cheyne", "Chick", "Chico", "Chill", "Chilton", "Chimelu", "Chip", "Chipo", "Chris", "Chrissy", "Christel", "Christof", "Christoph", "Christopher", "Chuck", "Cian", "Cicero", "Clancey", "Clancy", "Clarence", "Clark", "Clarke", "Claude", "Claudio", "Claus", "Clay", "Clayland", "Clayton", "Cleavant", "Cleave", "Cleavon", "Clem", "Clemens", "Clement", "Clemente", "Cliff", "Clifford", "Clifton", "Clint", "Clinton", "Clive", "Clove", "Clover", "Clovis", "Clyde", "Cobi", "Cocheta", "Cody", "Colbert", "Cole", "Coleman", "Coley", "Colin", "Collin", "Colm", "Colman", "Colt", "Colte", "Coltin", "Colton", "Columbia", "Columbine", "Columbus", "Comfort", "Conal", "Conall", "Conan", "Conell", "Conlan", "Conner", "Connor", "Conor", "Conrad", "Constantine", "Content", "Conway", "Cooper", "Corbin", "Cord", "Cordeiro", "Cordel", "Cordell", "Cordero", "Corey", "Corliss", "Cornelia", "Cornelis", "Cornelius", "Cornell", "Cort", "Corwin", "Cory", "Cosima", "Cosmo", "Coty", "Coy", "Coye", "Coyle", "Craig", "Creighton", "Crevan", "Criostoir", "Cristian", "Cristophe", "Crockett", "Cullen", "Curry", "Curt", "Curtis", "Cy", "Cyd", "Cyril", "Cyrus", "Dafydd", "Dagan", "Dahlia", "Dain", "Dakarai", "Dakoda", "Dakota", "Dallin", "Dalton", "Dalziel", "Damario", "Damarius", "Damian", "Damien", "Damion", "Damon", "Dan", "Dane", "Daniel", "Danil", "Danilo", "Danny", "Dante", "Danton", "Daray", "Darby", "Darcey", "Darcie", "Darcy", "Dard", "Daren", "Dareo", "Darian", "Darien", "Darin", "Dario", "Darious", "Darius", "Darnell", "Darrell", "Darren", "Darrin", "Darrius", "Darron", "Darryl", "Darshan", "Daryl", "Daryn", "Dasan", "Dashiell", "Dathan", "Davaid", "Davan", "Dave", "David", "Davin", "Davis", "Davu", "Dawson", "Dax", "Dayton", "Deacon", "Dean", "Dearl", "Declan", "Dedric", "Dedrick", "Del", "Delaney", "Delano", "Delbert", "Delvan", "Delvin", "Dembe", "Demetri", "Demetrius", "Demian", "Demitrius", "Dempsey", "Denis", "Dennis", "Denny", "Denver", "Denzel", "Deo", "Derek", "Derex", "Dermot", "Derora", "Derreck", "Derrell", "Derrick", "Des", "Desdemona", "Desmond", "Devaki", "Devan", "Deven", "Devin", "Devlan", "Devlin", "Devon", "Dewey", "Dewitt", "Dexter", "Diallo", "Diarmuid", "Diata", "Dick", "Dickson", "Diederick", "Diego", "Dieter", "Dillan", "Dillian", "Dillon", "Dimitri", "Dino", "Dion", "Dionysius", "Dionysus", "Dirc", "Dirk", "Dixon", "Dmitri", "Dmyphnah", "Doane", "Doctor", "Dolan", "Dolin", "Dolph", "Dom", "Domenic", "Domenica", "Dominic", "Dominick", "Dominy", "Don", "Donal", "Donald", "Donard", "Donato", "Donnell", "Donny", "Donovan", "Dontae", "Dorcey", "Dorset", "Dorsey", "Doug", "Dougal", "Douglas", "Douglass", "Doyle", "Doyt", "Drake", "Drew", "Dru", "Duane", "Dudley", "Duena", "Duff", "Duffie", "Dugan", "Duka", "Duke", "Dumi", "Duncan", "Dunixi", "Dunn", "Dunne", "Dustan", "Dustin", "Duston", "Dusty", "Dwayne", "Dwight", "Dylan", "Dylon", "Dyre", "Eadoin", "Eamon", "Ean", "Earl", "Earle", "Earnest", "Eastin", "Easton", "Eavan", "Eban", "Eben", "Ebenezer", "Eberhard", "Ed", "Eddie", "Eddy", "Edel", "Edgar", "Edison", "Edmond", "Edmund", "Edric", "Eduardo", "Edward", "Edwardo", "Edwin", "Efraim", "Efrat", "Efrem", "Efren", "Egan", "Egbert", "Egon", "Egor", "Eitan", "Elbert", "Elden", "Eldon", "Eldred", "Eleazar", "Elecio", "Elgin", "Eli", "Elia", "Eliab", "Elias", "Elijah", "Eliot", "Elisha", "Eljah", "Elke", "Ellas", "Elliot", "Elliott", "Ellis", "Ellsworth", "Elmer", "Elmo", "Elton", "Elu", "Elva", "Elvan", "Elvin", "Elvis", "Elwin", "Elwood", "Ely", "Emanuel", "Emanuele", "Emeline", "Emene", "Emerson", "Emilio", "Emmanuel", "Emmet", "Emmett", "Emry", "Enid", "Enos", "Enrico", "Enrique", "Enzo", "Eoin", "Eolande", "Ephraim", "Er", "Erasmus", "Eri", "Eric", "Erick", "Erik", "Erland", "Erme", "Ermin", "Ernest", "Ernie", "Erno", "Eros", "Errol", "Erv", "Ervin", "Ervine", "Erving", "Erwin", "Eryk", "Esben", "Eshe", "Esmond", "Espiridion", "Etan", "Ethan", "Ethelwulf", "Etienne", "Eugen", "Eugene", "Eulalie", "Evan", "Evander", "Everett", "Evert", "Ewan", "Ezekiel", "Ezra", "Fabian", "Fabio", "Fabiola", "Fabunni", "Fairfax", "Fala", "Farica", "Faris", "Farrell", "Faustine", "Fedor", "Felipe", "Felix", "Fell", "Ferdinand", "Fergal", "Fergie", "Fergus", "Ferguson", "Fernando", "Ferris", "Ferrol", "Fico", "Fidel", "Filippo", "Fineen", "Finley", "Finn", "Finna", "Fionan", "Fisk", "Fisseha", "Flan", "Flannery", "Flavian", "Fletcher", "Floyd", "Flynn", "Folkert", "Foluke", "Forbes", "Ford", "Fordon", "Forest", "Forrest", "Forrester", "Forster", "Foster", "Fox", "Foy", "Fraley", "Francisco", "Franck", "Franco", "Frank", "Franklin", "Franz", "Frasier", "Fred", "Freddie", "Freddy", "Frederica", "Frederick", "Frederik", "Fredrick", "Freed", "Freeman", "Fremont", "Fritz", "Fronde", "Fruma", "Frye", "Fulbright", "Fuller", "Fynn", "Gabriel", "Gad", "Gaddy", "Gadi", "Gael", "Gafna", "Gage", "Gainell", "Gaius", "Galbraith", "Gale", "Galen", "Galin", "Gallagher", "Galvin", "Gamada", "Gamal", "Gamaliel", "Ganit", "Garcia", "Gardner", "Gareth", "Garett", "Garfield", "Garland", "Garn", "Garrin", "Garrison", "Garron", "Garry", "Garson", "Garth", "Gary", "Gates", "Gautier", "Gavin", "Gavivi", "Gaylan", "Gaylord", "Gaynell", "Gazali", "Gazit", "Gearoid", "Geary", "Gelsey", "Gene", "Genet", "Gent", "Gentry", "Geoff", "Geoffrey", "George", "Gerald", "Geraldo", "Gerard", "Germaine", "Gerry", "Gian", "Gibson", "Gideon", "Gifford", "Gil", "Gilbe", "Gilbert", "Giles", "Gilles", "Gillespie", "Gino", "Giolla", "Giovanni", "Giuseppe", "Glen", "Glenn", "Glennon", "Godana", "Godfrey", "Gomer", "Gordon", "Gordy", "Grady", "Graeme", "Graham", "Gram", "Grant", "Granville", "Grayson", "Greer", "Greg", "Gregg", "Gregory", "Greyson", "Grif", "Griffin", "Grig", "Grover", "Gualtier", "Guban", "Guillermo", "Gunnar", "Gunther", "Gure", "Gustav", "Gustave", "Gustavo", "Gustov", "Guy", "Guyon", "Haben", "Habib", "Hada", "Hadar", "Hagan", "Haggan", "Haile", "Haines", "Hajari", "Hakan", "Hakeem", "Hale", "Hali", "Halil", "Halona", "Ham", "Hamal", "Hamilton", "Hamish", "Hamlet", "Hank", "Hans", "Hansen", "Hanson", "Hanzila", "Haracha", "Hardy", "Harlan", "Harlen", "Harmon", "Harold", "Harper", "Harris", "Harrison", "Harry", "Hart", "Haruni", "Harvey", "Hassan", "Hastin", "Haven", "Hawa", "Hayden", "Hayes", "Hazen", "Hazinac", "Heath", "Hector", "Hedwig", "Heiko", "Heinz", "Helge", "Heller", "Hendrick", "Hendrik", "Henri", "Henrik", "Henry", "Herb", "Herbert", "Heremon", "Hermann", "Herschel", "Hezekiah", "Hiba", "Hibah", "Hidalgo", "Hidi", "Hiero", "Hilton", "Hiram", "Holden", "Hollace", "Hollis", "Holt", "Homer", "Horace", "Horatio", "Horus", "Hosea", "Houston", "Howard", "Howe", "Howell", "Howie", "Hoyt", "Hubert", "Huey", "Hugh", "Hugo", "Humphrey", "Hunter", "Huso", "Hussein", "Huston", "Hy", "Hyacinth", "Hyman", "Iain", "Ian", "Ife", "Ige", "Iggi", "Iggy", "Ignatius", "Igor", "Ihab", "Ike", "Ilit", "Ilori", "Iman", "Imogene", "Imran", "Inari", "Inek", "Ineke", "Ingram", "Ion", "Ira", "Irma", "Irvin", "Irving", "Isaac", "Isaiah", "Isak", "Israel", "Issak", "Issay", "Ivan", "Ivo", "Ivrit", "Izzy", "Jabari", "Jabilo", "Jack", "Jackson", "Jaco", "Jacob", "Jacques", "Jadon", "Jadyn", "Jaegar", "Jaeger", "Jael", "Jaelin", "Jafaru", "Jagger", "Jahve", "Jair", "Jairo", "Jake", "Jakson", "Jalen", "Jamal", "James", "Jamese", "Jameson", "Jamie", "Jamil", "Jamison", "Janin", "Jansen", "Janson", "Janus", "Jarah", "Jared", "Jariath", "Jarko", "Jaron", "Jarred", "Jarret", "Jarrett", "Jarrod", "Jarvis", "Jasen", "Jason", "Jasper", "Javier", "Jay", "Jaydon", "Jayson", "Jazz", "Jeb", "Jeff", "Jefferson", "Jeffery", "Jeffrey", "Jengo", "Jensen", "Jerah", "Jered", "Jeremiah", "Jeremie", "Jeremy", "Jericho", "Jerico", "Jerimiah", "Jeris", "Jermaine", "Jerod", "Jerold", "Jerome", "Jerrell", "Jerrick", "Jerris", "Jerry", "Jeshua", "Jesiah", "Jesse", "Jesus", "Jethro", "Jim", "Jimbo", "Jimmie", "Jimmy", "Jira", "Jiri", "Jirka", "Joachim", "Joachin", "Joaquim", "Job", "Jobe", "Jobey", "Joby", "Jock", "Joe", "Joel", "Joey", "Johahn", "Johan", "Johanne", "Johannes", "Johaunn", "John", "Johnathan", "Johnny", "Jon", "Jonah", "Jonathan", "Jonny", "Joost", "Jordan", "Jordyn", "Jorge", "Jorie", "Jose", "Josef", "Joseph", "Josh", "Joshua", "Josiah", "Joss", "Jovan", "Juan", "Jud", "Judah", "Judas", "Judd", "Jude", "Judson", "Jule", "Jules", "Julian", "Julio", "Julius", "Jumoke", "Junior", "Jur", "Jure", "Juri", "Jurian", "Jurrian", "Justin", "Justina", "Justise", "Justus", "J�rg", "Kabibe", "Kabili", "Kacela", "Kachina", "Kaden", "Kadin", "Kaellen", "Kahdijah", "Kaikura", "Kaiser", "Kale", "Kaleb", "Kamal", "Kamali", "Kambill", "Kame", "Kande", "Kareem", "Karel", "Karik", "Karim", "Karimah", "Karl", "Karna", "Karson", "Kaseko", "Kasi", "Kasim", "Kaspar", "Kassidi", "Kato", "Kaula", "Kayson", "Kaz", "Kazi", "Keagan", "Keaghan", "Keaira", "Keanu", "Keary", "Keaton", "Keb", "Kedem", "Kedrick", "Keefe", "Keegan", "Keeghan", "Keenan", "Keene", "Kees", "Keir", "Keith", "Kelby", "Kelda", "Keleigh", "Kelila", "Kellan", "Kellea", "Kellee", "Kellen", "Kellsie", "Kelton", "Keltyn", "Kelvin", "Ken", "Kendal", "Kendall", "Kendi", "Kendyl", "Kendyll", "Kennan", "Kenneth", "Kenny", "Kent", "Kenton", "Kenyi", "Kenyon", "Kenzie", "Kerel", "Kermit", "Kerr", "Kerry", "Kester", "Ketara", "Keven", "Kevin", "Kevis", "Khadija", "Khadijah", "Khaled", "Khalil", "Khal�l", "Kibbe", "Kibbey", "Kiel", "Kieran", "Kiernan", "Kiki", "Kiley", "Killian", "Kimball", "Kimo", "Kin", "Kincaid", "Kinfe", "King", "Kingsley", "Kinsey", "Kione", "Kip", "Kipling", "Kipp", "Kirabo", "Kirby", "Kiril", "Kirk", "Kiros", "Kitoko", "Kitra", "Kiyoshi", "Klaus", "Kobe", "Kobi", "Kobie", "Koby", "Koda", "Kody", "Koen", "Kolby", "Kolin", "Kolton", "Konrad", "Korbin", "Korey", "Kota", "Krishna", "Kristofer", "Kristoffer", "Kristopher", "Kuron", "Kurt", "Kwanita", "Kylan", "Kyle", "Kyler", "Kyna", "Kyrene", "Lachlan", "Lael", "Laird", "Lajuan", "Lale", "Lamar", "Lamont", "Lance", "Lancelot", "Landers", "Landis", "Landry", "Lane", "Lang", "Langdon", "Langer", "Langston", "Lankston", "Laron", "Larry", "Lars", "Larvall", "Lasca", "Laszlo", "Latham", "Latika", "Latimer", "Laurence", "Laurens", "Laval", "Lavan", "Lave", "Lavey", "Lavi", "Lavon", "Lavonn", "Lawrence", "Lazar", "Lazarus", "Leander", "Leavitt", "Lech", "Leda", "Ledell", "Leeto", "Lehana", "Leif", "Leimomi", "Leith", "Leland", "Leo", "Leon", "Leonard", "Leonzal", "Leopold", "Lerato", "Leroy", "Les", "Lester", "Levant", "Leverett", "Levi", "Levia", "Levon", "Lewis", "Lewon", "Lex", "Liam", "Liliha", "Lilo", "Linc", "Lincoln", "Lindon", "Lindy", "Link", "Linton", "Linus", "Lionel", "Lirit", "Lisimba", "Lisle", "Llewellyn", "Lloyd", "Locke", "Logan", "Lohn", "Lolonyo", "Lolovivi", "Lon", "Lona", "Lonato", "London", "Lonnie", "Lorcan", "Loren", "Lorenzo", "Lorimer", "Loring", "Lorne", "Lou", "Loughlin", "Louie", "Louis", "Lowell", "Luc", "Lucas", "Luce", "Lucian", "Lucius", "Lucus", "Ludlow", "Ludwig", "Luigi", "Luis", "Lukas", "Luke", "Lundy", "Luong", "Luther", "Lyde", "Lyle", "Lync", "Lynch", "Lynde", "Lyndon", "Lynne", "Lynton", "Lyre", "Lyris", "Lysander", "Maarten", "Maat", "Mac", "Macha", "Mack", "Mackenzie", "Macklin", "Macon", "Maddox", "Magee", "Magnus", "Maha", "Mahari", "Mahdi", "Mahyar", "Maitland", "Major", "Makalo", "Makenna", "Malachi", "Malachy", "Malaika", "Malcolm", "Malik", "Malomo", "Malone", "Mandel", "Manica", "Manning", "Manny", "Manolatos", "Mansa", "Manuel", "Marc", "Marcel", "Marcello", "Marcellus", "Marco", "Marcos", "Marcus", "Mariatu", "Marin", "Marino", "Mario", "Mark", "Marka", "Marko", "Markus", "Marley", "Marlow", "Maro", "Marques", "Marquis", "Marshall", "Martel", "Martell", "Martin", "Marty", "Marv", "Marvene", "Marvin", "Masada", "Maselyn", "Maslin", "Mason", "Mateo", "Mathieu", "Matt", "Matteo", "Matthew", "Matthias", "Mattox", "Mauli", "Maulo", "Maurice", "Maurilio", "Maverick", "Max", "Maxim", "Maxime", "Maximilian", "Maximillian", "Maximillion", "Maxwell", "Mayes", "Maynard", "Mckale", "Mckenzie", "Mea", "Medard", "Meelao", "Meged", "Meier", "Meir", "Melchior", "Melora", "Melva", "Melvin", "Melvyn", "Mendel", "Menora", "Mercer", "Mercury", "Meria", "Merle", "Merlin", "Merrill", "Merv", "Mervin", "Mervyn", "Meryl", "Meryle", "Messina", "Meyer", "Micah", "Michael", "Micheal", "Michel", "Michiel", "Mick", "Mickey", "Miguel", "Mika", "Mikaili", "Mike", "Mikel", "Mikhail", "Milandu", "Miles", "Miller", "Mills", "Milo", "Milson", "Milt", "Milton", "Mircea", "Miroslav", "Mirza", "Misae", "Misha", "Mitch", "Mitchel", "Mitchell", "Miyanda", "Mizell", "Mohamad", "Mohammed", "Moke", "Monahan", "Monroe", "Montague", "Montana", "Monte", "Montego", "Montgomery", "Monty", "Morathi", "Mordecai", "More", "Morey", "Morgen", "Morley", "Morrie", "Morris", "Morrison", "Morse", "Mort", "Mortimer", "Morton", "Morty", "Moses", "Moshe", "Moss", "Moya", "Muhammad", "Muhammed", "Muna", "Murphy", "Murray", "Musoke", "Mutia", "Mycroft", "Mykal", "Myles", "Myron", "Naal", "Nabil", "Nadav", "Nadiv", "Nahme", "Naiser", "Nakima", "Nalo", "Namir", "Napoleon", "Narcissus", "Nardo", "Nash", "Nasha", "Nasser", "Nat", "Nate", "Nathan", "Nathaniel", "Natine", "Natividad", "Natori", "Navarro", "Naveen", "Nayer", "Neal", "Ned", "Nedim", "Nedra", "Neetee", "Nehemiah", "Neil", "Nelson", "Nen", "Neriah", "Nerita", "Neriya", "Nero", "Nesbit", "Netanya", "Nevan", "Neville", "Nevin", "Newman", "Niall", "Niambi", "Nic", "Nicandro", "Niccolo", "Nicholai", "Nicholas", "Nick", "Nickel", "Nicklas", "Nickolas", "Nico", "Nicola", "Nicolas", "Niel", "Niels", "Nigel", "Nikkolas", "Nino", "Nira", "Nitara", "Noah", "Nodin", "Noelani", "Nolan", "Noland", "Noma", "Norbert", "Noriel", "Norm", "Norman", "Norris", "Norton", "Nowles", "Noya", "Nuri", "Nyako", "Nyeki", "Nyle", "Nyx", "Oakes", "Oakley", "Obadiah", "Obbie", "Obed", "Obediah", "Obedience", "Oberon", "Obert", "Octavio", "Odell", "Odin", "Odysseus", "Ofer", "Ogden", "Ohad", "Ohio", "Okal", "Okapi", "Oke", "Olaf", "Oleg", "Oleh", "Olen", "Olive", "Oliver", "Olivier", "Ollie", "Omar", "Onan", "Oneal", "Oneil", "Oral", "Oran", "Orane", "Orde", "Oren", "Oria", "Orien", "Oringo", "Orion", "Orlando", "Orma", "Ormand", "Orrick", "Orrin", "Orris", "Orsen", "Orsin", "Orson", "Orval", "Orville", "Osaze", "Osborn", "Osborne", "Oscar", "Osgood", "Osias", "Oskar", "Osma", "Osmaan", "Osman", "Osmond", "Osvaldo", "Oswald", "Othello", "Othneil", "Otis", "Otomo", "Otoneil", "Otto", "Ouray", "Overton", "Ovid", "Owen", "Oz", "Ozzie", "Packard", "Paco", "Padraic", "Paley", "Palti", "Pancho", "Panfila", "Paolo", "Paris", "Parker", "Parkin", "Parlan", "Parley", "Parrish", "Parry", "Parson", "Pascal", "Pascale", "Pascha", "Pasi", "Patrick", "Patton", "Paul", "Pauline", "Paulo", "Paulos", "Pax", "Paxton", "Payton", "Peale", "Pedro", "Pelham", "Pembroke", "Penn", "Pepe", "Percival", "Percy", "Peregrine", "Perrin", "Perry", "Peta", "Pete", "Peter", "Petrus", "Peyton", "Phelan", "Phemia", "Phiala", "Phil", "Phila", "Philip", "Phillip", "Phoenix", "Pierce", "Pierre", "Pieter", "Pirro", "Placido", "Platt", "Ponce", "Porter", "Potter", "Prakash", "Prentice", "Prescott", "Preston", "Price", "Primo", "Primoz", "Prince", "Princeton", "Quentin", "Quenton", "Quillan", "Quimby", "Quincey", "Quincy", "Quinlan", "Quinn", "Quinta", "Quintin", "Rach", "Rafe", "Raffaello", "Rafi", "Raimi", "Raleigh", "Ralph", "Ramesh", "Ramiro", "Ramon", "Ramsay", "Ramses", "Ramsey", "Ramzi", "Randal", "Randall", "Randin", "Randle", "Randolph", "Randy", "Ranit", "Ransford", "Ransom", "Raphael", "Rashad", "Rasheed", "Rashid", "Rashida", "Raul", "Ravi", "Rawlin", "Rawlins", "Ray", "Rayce", "Raymond", "Raymonde", "Raynon", "Read", "Reagan", "Red", "Redford", "Reece", "Reed", "Reese", "Reeves", "Reginald", "Reid", "Reilly", "Reily", "Reinhard", "Reinhart", "Remedy", "Remington", "Remond", "Remy", "Renato", "Rennie", "Renny", "Reno", "Reth", "Reuben", "Revelin", "Rex", "Rey", "Reynard", "Reynold", "Reynoldo", "Rhett", "Rhodes", "Rhys", "Ric", "Ricardo", "Rice", "Rich", "Richard", "Ricjunette", "Rick", "Rickey", "Ricky", "Rico", "Rider", "Riely", "Rigoberto", "Riko", "Rileigh", "Ringo", "Riordan", "Rob", "Robert", "Rocco", "Rock", "Rockford", "Rockne", "Rocky", "Rod", "Rodd", "Roddy", "Roderick", "Rodger", "Rodney", "Rodrigo", "Rodrigue", "Rodrigues", "Rodriguez", "Rogan", "Roger", "Rohan", "Roland", "Rolando", "Rolf", "Rolin", "Rollin", "Rollins", "Rollo", "Roma", "Roman", "Romeo", "Romulo", "Romulus", "Ron", "Ronald", "Ronan", "Ronat", "Rondel", "Rondell", "Roni", "Ronli", "Ronnie", "Ronny", "Roosevelt", "Rorey", "Rori", "Rory", "Ross", "Rowan", "Rowdy", "Roy", "Royce", "Ruairidh", "Ruarai", "Ruben", "Rudolf", "Rudolph", "Rudra", "Rudy", "Rueben", "Rupert", "Russ", "Russom", "Rusti", "Rusty", "Ryan", "Ryker", "Rylan", "Ryley", "Rylie", "Ryne", "Sabino", "Sacha", "Saddam", "Salal", "Salome", "Salvador", "Salvator", "Sam", "Sameer", "Samir", "Sampson", "Samson", "Samuel", "Sandro", "Sanford", "Santana", "Santiago", "Saul", "Sawyer", "Schafer", "Schuylar", "Schuyler", "Scott", "Seamus", "Sean", "Sebastian", "Selwyn", "Sepp", "Serge", "Sergei", "Sergio", "Seth", "Sethe", "Severa", "Severas", "Shadi", "Shadoe", "Shadow", "Shady", "Shaeffer", "Shakil", "Shaman", "Shane", "Shaquille", "Shaw", "Shawn", "Shelby", "Sheldon", "Shelton", "Sheridan", "Sherill", "Sherman", "Sherril", "Sherwin", "Shilo", "Shiloh", "Siddharta", "Sidney", "Siegfried", "Sigfred", "Sigmund", "Silvano", "Silvester", "Silvio", "Simeon", "Simon", "Skeet", "Skeeter", "Skipper", "Skylar", "Skyler", "Slade", "Sloan", "Sloane", "Sly", "Socrates", "Sol", "Solomon", "Solon", "Sonny", "Speedy", "Spencer", "Spiridion", "Stan", "Stanford", "Stanislaw", "Stanley", "Stanton", "Stavros", "Steel", "Steele", "Stefan", "Stefano", "Stephen", "Sterling", "Sterlington", "Steve", "Steven", "Stewart", "Stiles", "Stone", "Stonewall", "Storm", "Stuart", "Styles", "Sullivan", "Sumner", "Suraj", "Sutton", "Sven", "Syrus", "Tad", "Tai", "Takeya", "Talbot", "Tallulah", "Talon", "Tamid", "Tamzen", "Tanner", "Tarance", "Tarek", "Tarrance", "Tavis", "Tavish", "Taylor", "Taz", "Ted", "Teman", "Temani", "Tempest", "Temple", "Terence", "Terrell", "Terrence", "Tevye", "Thaddeus", "Than", "Thaniel", "Thayne", "Theo", "Theobald", "Theodore", "Theodoric", "Theophilus", "Theron", "Thom", "Thomas", "Thomson", "Thor", "Thorburn", "Thorin", "Thorstan", "Thorsten", "Thorston", "Thurston", "Tiago", "Tibor", "Tierry", "Tiger", "Tim", "Timeus", "Timon", "Timothy", "Tito", "Titus", "Tivoli", "Toal", "Tobias", "Toby", "Todd", "Tom", "Tommy", "Tony", "Tor", "Torin", "Torleif", "Torsten", "Trace", "Tranter", "Travis", "Trayc", "Tre", "Trefor", "Tremaine", "Tremayne", "Trent", "Trenton", "Trever", "Trevis", "Trevor", "Trey", "Trinidad", "Tristan", "Tristen", "Tristram", "Troy", "Truman", "Tuan", "Tucker", "Tulio", "Tully", "Turner", "Twain", "Ty", "Tye", "Tyler", "Tylor", "Tym", "Tyree", "Tyrel", "Tyrell", "Tyrese", "Tyrone", "Tysen", "Tyson", "Ugo", "Uilliam", "Uland", "Ulandus", "Ulf", "Ulises", "Ulliem", "Ulric", "Ulrich", "Ultan", "Ulysses", "Umberto", "Uri", "Uriah", "Uriel", "Urien", "Ushma", "Uthman", "Valdemar", "Valente", "Valentine", "Vallis", "Van", "Vance", "Vander", "Vandyke", "Vani", "Vasilios", "Vasilis", "Vaughan", "Vaughn", "Vern", "Vernon", "Victor", "Victori", "Vilmar", "Vinal", "Vincent", "Vinson", "Virgil", "Virgilio", "Vivek", "Vladilen", "Vladimir", "Vladislav", "Volker", "Volodymyr", "Vulcan", "Wade", "Waldo", "Walker", "Wallace", "Wally", "Walter", "Walton", "Waltraud", "Wang", "Warren", "Washington", "Wayman", "Waymon", "Waymond", "Wayne", "Wendell", "Werner", "Wes", "Wesley", "Westin", "Westney", "Weston", "Whitfield", "Wil", "Wilbur", "Wiley", "Wilfred", "Wilfrid", "Wilfried", "Wilhelm", "Wilhelmien", "Will", "Willard", "Willem", "William", "Willie", "Willis", "Wilmer", "Wilmot", "Wilson", "Winifred", "Winston", "Winthrop", "Wolf", "Wolfe", "Wolff", "Wolffe", "Wolfgang", "Wolfram", "Woodrow", "Woody", "Wright", "Wyatt", "Wyeth", "Xander", "Xavier", "Xylon", "Yakov", "Yan", "Yann", "Yannic", "Yannis", "Yari", "Yasir", "Yasser", "Yevgeniy", "Yevgenyi", "Yitzhak", "Yong", "York", "Yoshi", "Yuri", "Yuriy", "Yves", "Zach", "Zachariah", "Zachary", "Zachery", "Zack", "Zackary", "Zaid", "Zandy", "Zane", "Zavier", "Zayd", "Zeb", "Zebadiah", "Zebulon", "Zedekiah", "Zeke", "Zen", "Zeno", "Zenon", "Zephyr", "Ziggy", "Zimraan", "Zuriel"];

    new autoComplete(aNames, document.getElementById('txt'), document.getElementById('suggest'), 10);
}