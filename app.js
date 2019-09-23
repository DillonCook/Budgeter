const budgetController = (() => { // =================================== Budget Control =======================================

    class Expense {
        constructor(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

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
    }

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

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }


    }
})();




const UIController = (() => { // =============================== UI Control ======================================

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputDollarAmount: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list'
    }
        return {
            getInput: () => {
                return {   
                    type: document.querySelector(DOMstrings.inputType).value,   // will be either inc for income or exp or expense
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputDollarAmount).value)
                };
            },
            addListItem: (obj, type) => {
                let html, element;
                // Create HTML string with placeholder text
                if (type === 'inc') {
                    element = DOMstrings.incomeContainer;
                    html = `<div class="item" id="income-${obj.id}"><div class="item__description">${obj.description}</div><div class="right">
                <div class="item__value">+ ${obj.value}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
                } else if (type === 'exp') {
                    element = DOMstrings.expenseContainer;
                    html = `<div class="item" id="expense-${obj.id}"><div class="item__description">${obj.description}</div>
                <div class="right"><div class="item__value">- ${obj.value}</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
                }                
                
                // Insert HTML into DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', html);
            },

            // Resets values after submission
            clearFields: () => {
                let fields;

                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputDollarAmount);

                fields.forEach(field => field.value = "");

                fields[0].focus();
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
    }

    const updateBudget = () => {
        
        // Calculate budget
        budgetCtrl.calculateBudget();

        // Return budget
        let budget = budgetCtrl.getBudget();
        console.log(budget);
        

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
        

    return {
        init: () => {
            console.log('Initiated');
            eventListeners();          
        }
    };

})(budgetController, UIController);

controller.init();