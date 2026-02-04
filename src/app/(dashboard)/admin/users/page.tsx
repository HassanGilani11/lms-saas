import { redirect } from "next/navigation";

const UsersPage = () => {
    return redirect("/admin/users/administrator");
};

export default UsersPage;
