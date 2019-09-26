const budgetController = (() => { // =================================== Budget Control =======================================

    class Expense {
        constructor(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = ((this.value / totalIncome) * 100).toFixed(2);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    let calculateTotal = (type) => {
        let total = 0;
        data.allItems[type].forEach((incomes) => {
            total += incomes.value;
        });
        data.totals[type] = total;
    };

    let data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: (type, desc, val) => {
            let newItem, ID;
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;                
            } else {
                ID = 0;
            }
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            // Push it into our data structure
            data.allItems[type].push(newItem);

            return newItem;
        },

        testing: () => {
            console.log(data);
        },

        deleteItem: (type, id) => {
            let ids, index;

            ids = data.allItems[type].map((current) => {
                return current.id;
            });

            index = ids.indexOf(id);            

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            

        },
        
        calculateBudget: () => {

            // calculate total incomes and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: () => {

            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: () => {

            let allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: '-' + data.totals.exp,
                percentage: data.percentage
            };
        }


    };
})();




const UIController = (() => { // =============================== UI Control ======================================

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputDollarAmount: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        listItemPercentage: '.item__percentage',
        container: '.container',
        dateLabel: '.budget__title--month'

    }
        return {
            getInput: () => {
                return {   
                    type: document.querySelector(DOMstrings.inputType).value,   // will be either inc for income or exp or expense
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputDollarAmount).value)
                };
            },

            formatNumber: (num) => {
                let numSplit, int, dec;

                num = Math.abs(num);
                num = num.toFixed(2);
                numSplit = num.split('.');

                int = numSplit[0];
                if (int.length > 3) {
                    int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2145, output 2,145
                }

                dec = numSplit[1];

                return int + '.' + dec;

            },

            addListItem: (obj, type) => {
                let html, element;
                let newValue = UIController.formatNumber(obj.value);

                // Create HTML string with placeholder text
                if (type === 'inc') {
                    element = DOMstrings.incomeContainer;
                    html = `<div class="item" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right">
                <div class="item__value">+ ${newValue}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
                } else if (type === 'exp') {
                    element = DOMstrings.expenseContainer;
                    html = `<div class="item" id="exp-${obj.id}"><div class="item__description">${obj.description}</div>
                <div class="right"><div class="item__value">- ${newValue}</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
                }                
                
                // Insert HTML into DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', html);
            },

            deleteListItem: (selectorID) => {
                let el = document.getElementById(selectorID);

                el.parentNode.removeChild(el);


            },

            // Resets values after submission
            clearFields: () => {
                let fields;

                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputDollarAmount);

                fields.forEach(field => field.value = "");

                fields[0].focus();
            },

            displayBudget: (obj) => {

                document.querySelector(DOMstrings.budgetLabel).textContent = '$' + UIController.formatNumber(obj.budget);
                document.querySelector(DOMstrings.incomeLabel).textContent = '$' + UIController.formatNumber(obj.totalInc);
                document.querySelector(DOMstrings.expensesLabel).textContent = '$' + UIController.formatNumber(obj.totalExp);

                if (obj.percentage > 0) {
                    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '--';
                }
            },

            displayPercentages: (percentages) => {

                let fields = document.querySelectorAll(DOMstrings.listItemPercentage);

                nodeListForEach = (list, callback) => {
                    for (let i = 0; i < list.length; i++) {
                        callback(list[i], i)
                        
                    }
                };

                nodeListForEach(fields, (current, index) => {

                    if (percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '--';
                    }
                });

            },

            displayMonth: () => {

                let now = new Date();

                const year = now.getFullYear();
                const month = now.toLocaleString('default', { month: 'long' });

                document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;

            },

            changedType: () => {

                let field = document.querySelector(DOMstrings.inputType);
                field.classList.toggle('red-focus');

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');


            },

            getDOMstrings: () => {
                return DOMstrings;
            }
        }
})();



// ============================================ Global App controller ========================================
const controller = ((budgetCtrl, UICtrl) => {
    let DOM = UICtrl.getDOMstrings();

    const eventListeners = () => {

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 || e.which === 13) {                    
                ctrlAddItem();                
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    const updateBudget = () => {
        
        // Calculate budget
        budgetCtrl.calculateBudget();

        // Return budget
        let budget = budgetCtrl.getBudget();
        
        // display 
        UICtrl.displayBudget(budget);

    }

    const updateItemPercentage = () => {

        // calculate list item percentages
        budgetCtrl.calculatePercentages();        

        // return numbers
        let percentages = budgetCtrl.getPercentages();

        // display on UI
        UICtrl.displayPercentages(percentages);
        
    }

    let ctrlAddItem = () => {
        let input, newItem;

        // Get input data
        input = UICtrl.getInput();
            
        // Add item to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // form validation, add item, then clear fields
        if (input.description !== "" && input.value > 0) {

            // Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // Clear field values after submission
            UICtrl.clearFields();

            // calculate and update budget
            updateBudget();

            // calculate and update list item percentages
            updateItemPercentage();


        } else {
            let fields = document.querySelectorAll(DOM.inputDescription + ', ' + DOM.inputDollarAmount);
            fields.forEach(field => {
                field.style.border = "1px solid tomato";
                setTimeout(() => {
                    field.style.border = "1px solid #e7e7e7";
                }, 1000);
            });
        }    
    };


    let ctrlDeleteItem = (e) => {

        let itemID, splitID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
                        
            // delete item from data structure
            budgetCtrl.deleteItem(type, ID)

            // delete item from UI
            UICtrl.deleteListItem(itemID);

            // update new totals
            updateBudget();

            // calculate and update list item percentages
            updateItemPercentage();
        }
        

    }
        

    return {
        init: () => {
            console.log('Initiated');
            eventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });        
        }
    };

})(budgetController, UIController);

controller.init();
