export const checkAndSendUser = () => {
  let USER_ID = localStorage.getItem("user_id");

  //TODO: currently
  if (1) {
    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_type: "student" }), // or 'teacher' based on your logic
    })
      .then((response) => response.json())
      .then((data) => {
        USER_ID = data.user_id;
        localStorage.setItem("user_id", USER_ID || "");
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });
  }
};
