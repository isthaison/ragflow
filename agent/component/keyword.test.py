import re

def resub(ans=""):
    if "keyword:" not in ans:
        return ans
    ans = re.sub(r"^.*</think>\s*", "", ans, flags=re.DOTALL)
    ans = re.sub(r".*keyword:\s*", "", ans, flags=re.DOTALL).strip()
    return ans

def test_resub():
    cases = [
        ("<think>something</think>keyword: apple, banana", "apple, banana"),
        ("random text </think> keyword: dog, cat", "dog, cat"),
        ("keyword: test1, test2", "test1, test2"),
        ("irrelevant text", "irrelevant text"),
        ("<think>ignore</think>keyword: one", "one"),
        ("Câu hỏi này yêu cầu tìm tổng số lượng PO Fail trong tháng 1 năm 2025.\n\nkeyword: Tổng số PO Fail, tháng 1 năm 2025, PO Fail, mã PO, QC_AI, thông tin cơ bản, kiểm tra chất lượng, khiếu nại khách hàng\n","Tổng số PO Fail, tháng 1 năm 2025, PO Fail, mã PO, QC_AI, thông tin cơ bản, kiểm tra chất lượng, khiếu nại khách hàng")

    ]
    for input_str, expected in cases:
        output = resub(input_str)
        print(f"{input_str}============{output}") 
        # Optionally, you can assert correctness:
        assert output == expected

if __name__ == "__main__":
    test_resub()
    print("All resub tests passed.")
