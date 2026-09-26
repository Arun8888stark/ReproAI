const DEMO = "http://localhost:8081";

export const EXAMPLES = [
  { label: "Quiz score is 0", url: `${DEMO}/#/quiz`, text: "I answered all quiz questions correctly (4, New Delhi, Hyper Text Markup Language) but after submitting my score shows 0." },
  { label: "Coupon total wrong", url: `${DEMO}/#/checkout`, text: "I applied the STUDENT10 coupon on the 500 rupee course. It should give 10% off but the total became 50 instead of 450." },
  { label: "Search finds nothing", url: `${DEMO}/#/courses`, text: "I searched python on the courses page and it says no courses found, but there is a Python course." },
  { label: "Progress above 100%", url: `${DEMO}/#/progress`, text: "I kept clicking mark lesson complete and my progress went above 100%, it showed 120%. The course has only 5 lessons." },
  { label: "Bio disappears", url: `${DEMO}/#/profile`, text: "When I change my name on the profile page and click save, my bio disappears." },
  { label: "Works fine (control)", url: `${DEMO}/#/courses`, text: "When I type Python in the course search, the Python Basics course does not show up." },
];
