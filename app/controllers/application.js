import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object'

export default class ApplicationController extends Controller {

    constructor() {
        super(...arguments)
        this.loadAmount();
        this.loadSubscription();
        this.loadHistory();
    }

    @tracked amount = 0;
    @tracked isModelOpen = false;
    @tracked isSubModelOpen = false;
    @tracked isEditing = false;
    @tracked editIndex = null;
    @tracked isFilterOpen = false;

    @tracked subscriptions = [];

    @tracked name = '';
    @tracked subplan = '';
    @tracked billcycle = '';
    @tracked subamount = '';
    @tracked category = '';
    @tracked paymethod = '';

    plans = ['Standard', 'Pro', 'Pro+'];
    billings = ['Weekly', 'Monthly', 'Yearly'];
    categories = ['Entertainment', 'Music', 'Amazon Prime', 'Jio Star'];
    paymentMethod = ['UPI', 'Debit Card', 'Net Banking', 'Wallet'];

    @tracked history = [];


    @action toggleModal() {
        this.isModelOpen = !this.isModelOpen;
    }

    @action toggleSubModal() {
        this.isSubModelOpen = !this.isSubModelOpen;
        this.resetInputs();
    }

    @action toggleFilter() {
        this.isFilterOpen = !this.isFilterOpen;
    }

    @action addToWallet() {
        // let credit = {
        //     name: this.subscriptions[index].name,
        //     subamount: this.subscriptions[index].subamount,
        //     transaction:"Refund"
        // }
        const value = document.getElementById('amount-value').value;
        this.amount = parseInt(this.amount) + parseInt(value);
        localStorage.setItem("amount", this.amount);
        this.toggleModal();
    }

    @action loadAmount() {
        const resAmount = localStorage.getItem("amount") || 0;
        this.amount = resAmount;
    }

    @action updateName(event) {
        this.name = event.target.value;
    }

    @action updatePlan(plan) {
        this.subplan = plan;
    }

    @action updateBilling(bill) {
        this.billcycle = bill;
    }

    @action updateAmount(event) {
        this.subamount = event.target.value;
    }

    @action updateCategory(cat) {
        this.category = cat;
    }

    @action updatePayment(pay) {
        this.paymethod = pay;
    }

    @action addSubscription() {
        let subscription = {
            name: this.name,
            subplan: this.subplan,
            billcycle: this.billcycle,
            subamount: this.subamount,
            category: this.category,
            paymethod: this.paymethod
        }

        if (!this.isEditing) {
            if (subscription.paymethod == "Wallet") {
                if (parseInt(this.subamount) <= parseInt(this.amount)) {
                    this.amount = this.amount - this.subamount;
                    localStorage.setItem("amount", this.amount);
                    this.subscriptions = this.subscriptions ? [...this.subscriptions, subscription] : [subscription];
                    localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
                    this.loadSubscription();
                    this.toggleSubModal();
                    this.resetInputs();
                    subscription.transaction = "Debit";
                    this.history = this.history ? [...this.history, subscription] : [subscription];
                    localStorage.setItem("history", JSON.stringify(this.history));
                    this.loadHistory();
                } else {
                    alert("Insufficient Wallet Balance");
                }
            } else {
                this.subscriptions = this.subscriptions ? [...this.subscriptions, subscription] : [subscription];;
                localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
                this.loadSubscription();
                this.toggleSubModal();
                this.resetInputs();
            }

        } else {
            this.subscriptions[this.editIndex] = subscription;
            this.isEditing = !this.isEditing;
            localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions))
            this.toggleSubModal();
            this.loadSubscription();
            this.resetInputs();
        }
    }

    @action editSubscription(index) {
        this.editIndex = index;
        this.isEditing = !this.isEditing;
        this.toggleSubModal();
        this.name = this.subscriptions[index].name;
        this.subplan = this.subscriptions[index].subplan;
        this.billcycle = this.subscriptions[index].billcycle;
        this.subamount = this.subscriptions[index].subamount;
        this.category = this.subscriptions[index].category;
        this.paymethod = this.subscriptions[index].paymethod;
    }

    @action dltSubscription(index) {
        this.subscriptions.splice(index, 1);
        this.subscriptions = [...this.subscriptions];
        localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
        this.loadSubscription();

    }

    @action cancelSubscription(index) {

        let cancelled = {
            name: this.subscriptions[index].name,
            subplan: this.subscriptions[index].subplan,
            billcycle: this.subscriptions[index].billcycle,
            subamount: this.subscriptions[index].subamount,
            category: this.subscriptions[index].category,
            paymethod: this.subscriptions[index].paymethod,
            transaction:"Refund"
        }

        if (this.subscriptions[index].paymethod == "Wallet") {
            this.amount = parseInt(this.amount) + parseInt(this.subscriptions[index].subamount);
            localStorage.setItem("amount", this.amount);
            this.history = this.history ? [...this.history, cancelled] : [cancelled];
            localStorage.setItem("history", JSON.stringify(this.history));
            this.loadHistory();
            alert("Amount refunded to wallet");
        }
        this.subscriptions.splice(index, 1);
        this.subscriptions = [...this.subscriptions];
        localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
        this.loadSubscription();
    }

    @action resetInputs() {
        this.name = '';
        this.subplan = '';
        this.billcycle = '';
        this.subamount = '';
        this.category = '';
        this.paymethod = '';
    }

    @action loadSubscription() {
        const resSubscription = JSON.parse(localStorage.getItem("subscriptions"));
        this.subscriptions = resSubscription;
        console.log(this.subscriptions);
    }

    @action loadHistory() {
        const resHistory = JSON.parse(localStorage.getItem("history"));
        this.history = resHistory;
        console.log(this.history);
    }
}
