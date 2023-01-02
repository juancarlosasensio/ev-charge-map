export function formattedPhone(str) {
    let phoneArr = Array.from(str);
    if (phoneArr.length < 12) {
        return "";
    }
    let phoneNums = [];
    for (let i = 0; i < phoneArr.length; i++) {
        let val = parseInt(phoneArr[i])
        if (!isNaN(val)) {
            phoneNums.push(val);
        }
    }
    let formattedPhone = phoneNums.join("");
    let formattedPhoneNo = `(${formattedPhone.slice(0, 3)})-${formattedPhone.slice(3, 6)}-${formattedPhone.slice(6, 10)} `
    return formattedPhoneNo;
};