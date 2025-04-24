import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import {action} from '@ember/object'

export default class ApplicationController extends Controller {

    constructor() {
        super(...arguments)
        this.loadAmount();
        this.loadSubscription();
    }

    @tracked amount=0;
    @tracked isModelOpen =  false;
    @tracked isSubModelOpen =  false;

    @tracked subscriptions = [];

    @tracked name ='';
    @tracked subplan='';
    @tracked billcycle='';
    @tracked subamount='';
    @tracked category='';
    @tracked paymethod='';

    plans=['Standard', 'Pro', 'Pro+'];
    billings=['Weekly', 'Monthly', 'Yearly'];
    categories=['Entertainment', 'Music', 'Amazon Prime', 'Jio Star'];
    paymentMethod = ['UPI', 'Debit Card', 'Net Banking', 'Wallet']

    @action toggleModal() {
        this.isModelOpen = !this.isModelOpen;
    }

    @action toggleSubModal() {
        this.isSubModelOpen = !this.isSubModelOpen;
    }

    @action addToWallet() {
        const value = document.getElementById('amount-value').value;
        this.amount=parseInt(this.amount)+ parseInt(value);
        localStorage.setItem("amount",this.amount);
        this.toggleModal();
    }

    @action loadAmount() {
        const resAmount= localStorage.getItem("amount");
        this.amount=resAmount;
    }

    @action updateName(event) {
        this.name= event.target.value;
    }

    @action updatePlan(plan) {
        this.subplan=plan;
    }

    @action updateBilling(bill) {
        this.billcycle=bill;
    }

    @action updateAmount(event) {
        this.subamount=event.target.value;
    }

    @action updateCategory(cat) {
        this.category=cat;
    }

    @action updatePayment(pay) {
        this.paymethod=pay;
    }
    
    @action addSubscription() {
        if(this.subscriptions!=null){
            this.subscriptions=[...this.subscriptions, 
                {
                    name:this.name,
                    subplan:this.subplan,
                    billcycle:this.billcycle,
                    subamount:this.subamount,
                    category:this.category,
                    paymethod:this.paymethod
                }
            ];
            localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
            this.toggleSubModal();
        } else {
            this.subscriptions= [
                {
                    name:this.name,
                    subplan:this.subplan,
                    billcycle:this.billcycle,
                    subamount:this.subamount,
                    category:this.category,
                    paymethod:this.paymethod
                }
            ]
            localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions))
            this.loadSubscription();
            this.toggleSubModal();
        }
    }

    @action loadSubscription() {
        const resSubscription= JSON.parse(localStorage.getItem("subscriptions")); 
        this.subscriptions=resSubscription;
        console.log(this.subscriptions)
    }
}
