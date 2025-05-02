import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object'
import { task, timeout } from "ember-concurrency"

export default class ApplicationController extends Controller {

    constructor() {
        super(...arguments)
        this.loadAmount();
        this.loadSubscription();
        this.loadHistory();
        this.checkSubscription.perform();
    }

    @tracked amount = 0;
    @tracked isModelOpen = false;
    @tracked isSubModelOpen = false;
    @tracked isEditing = false;
    @tracked editIndex = null;
    @tracked isFilterOpen = false;

    @tracked subscriptions = [];
    @tracked history = [];
    @tracked filteredHistory = [];

    @tracked name = '';
    @tracked subplan = '';
    @tracked billcycle = '';
    @tracked subamount = '';
    @tracked category = '';
    @tracked paymethod = '';

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    plans = ['Standard', 'Pro', 'Pro+'];
    billings = ['Weekly', 'Monthly', 'Yearly', 'Minute', 'Seconds'];
    categories = ['Entertainment', 'Music', 'Amazon Prime', 'Jio Star'];
    paymentMethod = ['UPI', 'Debit Card', 'Net Banking', 'Wallet'];

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
        const value = document.getElementById('amount-value').value;
        if (value == '') {
            alert("Enter the amount");
            return;
        }
        let credit = {
            name: "Wallet",
            subamount: value,
            transaction: "Credit",
            subdate: {
                date: new Date().getDate(),
                day: new Date().getDay(),
                hour: new Date().getHours(),
                minute: new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes(),
                seconds: new Date().getSeconds(),
                month: this.months[new Date().getMonth()],
                year: new Date().getFullYear(),
            }
        }

        this.amount = parseInt(this.amount) + parseInt(value);
        this.history = this.history ? [...this.history, credit] : [credit];
        localStorage.setItem("history", JSON.stringify(this.history));
        localStorage.setItem("amount", this.amount);
        this.loadHistory();
        this.toggleModal();
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

    @action validitySetter(newDate) {
        return {
            dateObject: newDate,
            date: newDate.getDate(),
            day: newDate.getDay(),
            hour: newDate.getHours(),
            minute: newDate.getMinutes() < 10 ? "0" + newDate.getMinutes() : newDate.getMinutes(),
            seconds: newDate.getSeconds(),
            month: this.months[newDate.getMonth()],
            year: newDate.getFullYear(),
        }
    }

    @action addToLocal(subscription) {
        this.subscriptions = this.subscriptions ? [...this.subscriptions, subscription] : [subscription];
        localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
        this.loadSubscription();
        this.history = this.history ? [...this.history, subscription] : [subscription];
        localStorage.setItem("history", JSON.stringify(this.history));
        this.loadHistory();
        this.toggleSubModal();
        this.resetInputs();
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
                    subscription.transaction = "Debit";
                    subscription.subdate = {
                        date: new Date().getDate(),
                        day: new Date().getDay(),
                        hour: new Date().getHours(),
                        minute: new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes(),
                        seconds: new Date().getSeconds(),
                        month: this.months[new Date().getMonth()],
                        year: new Date().getFullYear(),
                    };
                    if (subscription.billcycle == "Monthly") {
                        var newDate = new Date(new Date().setDate(new Date().getDate() + 28));
                        subscription.validity = this.validitySetter(newDate);

                    } else if (subscription.billcycle == "Weekly") {
                        var newDate = new Date(new Date().setDate(new Date().getDate() + 7));
                        subscription.validity = this.validitySetter(newDate);

                    } else if (subscription.billcycle == "Yearly") {
                        var newDate = new Date(new Date().setDate(new Date().getDate() + 365));
                        subscription.validity = this.validitySetter(newDate);

                    } else if (subscription.billcycle == "Minute") {
                        var newDate = new Date(new Date().setMinutes(new Date().getMinutes() + 1));
                        subscription.validity = this.validitySetter(newDate);

                    } else if (subscription.billcycle == "Seconds") {
                        var newDate = new Date(new Date().setSeconds(new Date().getSeconds() + 5));
                        console.log(newDate);
                        subscription.validity = this.validitySetter(newDate);
                    }

                    this.addToLocal(subscription);
                } else {
                    alert("Insufficient Wallet Balance");
                }
            } else {
                this.addToLocal(subscription);
            }

        } else {
            if (subscription.billcycle == "Monthly") {
                var newDate = new Date(new Date().setDate(new Date().getDate() + 28));
                subscription.validity = this.validitySetter(newDate);

            } else if (subscription.billcycle == "Weekly") {
                var newDate = new Date(new Date().setDate(new Date().getDate() + 7));
                subscription.validity = this.validitySetter(newDate);

            } else if (subscription.billcycle == "Yearly") {
                var newDate = new Date(new Date().setDate(new Date().getDate() + 365));
                subscription.validity = this.validitySetter(newDate);

            } else if (subscription.billcycle == "Minute") {
                var newDate = new Date(new Date().setMinutes(new Date().getMinutes() + 1));
                subscription.validity = this.validitySetter(newDate);

            } else if (subscription.billcycle == "Seconds") {
                var newDate = new Date(new Date().setSeconds(new Date().getSeconds() + 20));
                console.log(newDate);
                subscription.validity = this.validitySetter(newDate);
            }
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
            transaction: "Refund"
        }

        if (this.subscriptions[index].paymethod == "Wallet") {
            this.amount = parseInt(this.amount) + parseInt(this.subscriptions[index].subamount);
            localStorage.setItem("amount", this.amount);
            cancelled.subdate = {
                date: new Date().getDate(),
                day: new Date().getDay(),
                hour: new Date().getHours(),
                minute: new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes(),
                seconds: new Date().getSeconds(),
                month: this.months[new Date().getMonth()],
                year: new Date().getFullYear(),
            };
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

    @action applyFilter() {
        let checkboxes = Array.from(document.querySelectorAll('input[name="filter-check"]:checked'));
        let checked = checkboxes.map(cb => cb.value)
        console.log(checked)
        if (checked == '') {
            alert("Select a filter");
            return;
        }
        this.filteredHistory = this.history.filter(h => {
            checked.includes(h.transaction.toLowerCase())
            console.log(checked.includes(h.transaction.toLowerCase()))
            // console.log(h.transaction.toLowerCase())
        }
            );
        this.toggleFilter();
    }

    @action clearFilter() {
        let cbs = document.querySelectorAll('input[name="filter-check"]:checked')
        cbs.forEach(cb => cb.checked = false);
        this.filteredHistory = this.history;
        this.toggleFilter();
    }

    @action resetInputs() {
        this.name = '';
        this.subplan = '';
        this.billcycle = '';
        this.subamount = '';
        this.category = '';
        this.paymethod = '';
    }

    @action loadAmount() {
        const resAmount = localStorage.getItem("amount") || 0;
        this.amount = resAmount;
    }

    @action loadSubscription() {
        const resSubscription = JSON.parse(localStorage.getItem("subscriptions"));
        this.subscriptions = resSubscription;
    }

    @action loadHistory() {
        const resHistory = JSON.parse(localStorage.getItem("history"));
        this.history = resHistory;
        this.filteredHistory = this.history;
    }


    @task *checkSubscription() {
        while (true) {
            console.log("Running")

            if (!this.subscriptions == '') {
                this.subscriptions.forEach((subs, index) => {

                    if (subs.billcycle == "Seconds" && new Date(subs.validity.dateObject) < new Date()) {
                        // console.log(new Date(subs.validity.dateObject) < new Date())
                        if (this.amount <= 0 || parseInt(this.amount) < parseInt(subs.subamount)) {
                            subs.notify = "Subscription ended-Wallet amount is insufficent"
                            this.subscriptions[index] = subs;
                            localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
                            this.loadSubscription();
                        } else {
                            subs.notify = ""
                            var newDate = new Date(new Date().setSeconds(new Date().getSeconds() + 20));
                            subs.subdate = {
                                date: new Date().getDate(),
                                day: new Date().getDay(),
                                hour: new Date().getHours(),
                                minute: new Date().getMinutes() < 10 ? "0" + new Date().getMinutes() : new Date().getMinutes(),
                                seconds: new Date().getSeconds(),
                                month: this.months[new Date().getMonth()],
                                year: new Date().getFullYear(),
                            }
                            
                            subs.validity = this.validitySetter(newDate);
                            this.amount = this.amount - subs.subamount;
                            localStorage.setItem("amount", this.amount);

                            localStorage.setItem("subscriptions", JSON.stringify(this.subscriptions));
                            this.loadSubscription();
                            this.history = this.history ? [...this.history, subs] : [subs];
                            localStorage.setItem("history", JSON.stringify(this.history));
                            this.loadHistory();
                        }

                    }

                })
            }


            yield timeout(5000);
        }
    }
}
