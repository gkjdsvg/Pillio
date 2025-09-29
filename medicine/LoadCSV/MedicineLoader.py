import csv
import os.path
import re
from collections import defaultdict
from email.policy import default

import chardet   # pip install chardet
import unicodedata
from pathlib import Path

from LoadCSV.Medicine import Medicine


class Medicine:
    def __init__(self, name, ingredient_code, product_code, company, date, notice_number, detail, note, insurance, source_file=None):
        self.product_code = product_code # 제품 코드
        self.ingredient_code = ingredient_code # 성분 코드
        self.item_name = name # 약 이름
        self.company = company # 제약사
        self.date = date # 공고일자
        self.notice_number = notice_number # 공고 번호
        self.detail = detail # 약품상세정보
        self.note = note # 비고
        self.insurance = insurance # 급여 여부
        self.source_file = source_file # 파일 이름

    def __repr__(self):
        return f"Medicine(name={self.item_name}, company={self.company})"


class MedicineLoader:
    def __init__(self):
        self.medicine_map = []
        self.files = [
            "csv/의약품안전사용서비스(DUR)_노인주의 품목리스트 2025.6.csv",
            "csv/의약품안전사용서비스(DUR)_노인주의(해열진통소염제) 품목리스트 2025.6.csv",
            "csv/의약품안전사용서비스(DUR)_병용금기 품목리스트 2025.6.csv",
            "csv/의약품안전사용서비스(DUR)_연령금기 품목리스트 2025.6.csv",
            "csv/의약품안전사용서비스(DUR)_임부금기 품목리스트 2025.6.csv",
        ]

    def detect_encoding(self, path: Path) -> str:
        with open(path, "rb") as f:
            raw = f.read(4096)
        result = chardet.detect(raw)
        return result["encoding"] or "utf-8"

    def ensure_length(self, row, length=10):
        """행 길이가 짧으면 '' 채우기"""
        return row + [""] * (length - len(row))

    def normalize(self, text: str) -> str:
        if not text:
            return ""
        n = unicodedata.normalize("NFKC", text)
        n = n.strip()
        n = n.replace("\ufeff", "").replace("\u00a0", "")  # BOM, NBSP 제거
        # 허용 문자만 남기기 (한글, 영문, 숫자)
        import re
        n = re.sub(r"[^가-힣a-zA-Z0-9]", "", n)
        return n.lower()

    def load_csv(self):
        for f in self.files:
            path = Path(f)

            # 인코딩 감지
            encoding = self.detect_encoding(path)
            print(f"🔎 {f} - detected encoding = {encoding}")

            if "임부금기" in f:
                encoding = "cp949"  # MS949와 동일

            # 구분자는 탭 or 콤마 위주
            with open(path, "r", encoding=encoding, errors="ignore") as csvfile:
                sample = csvfile.readline()
                delimiter = "\t" if sample.count("\t") >= sample.count(",") else ","

            # 실제 CSV 읽기
            with open(path, "r", encoding=encoding, errors="ignore") as csvfile:
                self.medicine_map = [] # 초기화
                reader = csv.reader(csvfile, delimiter=delimiter)
                next(reader, None)  # 헤더 스킵
                line_no = 0
                for row in reader:
                    line_no += 1
                    cols = self.ensure_length(row, 10)
                    if cols[0].startswith("\ufeff"):
                        cols[0] = cols[0][1:]

                    m = Medicine(
                        cols[3],  # 성분명
                        cols[0],  # 제품 코드
                        cols[1],  # 성분 코드
                        cols[2],  # 제품명
                        cols[4],  # 업소명
                        cols[5],  # 공고일자
                        cols[6],  # 공고번호
                        cols[7],  # 약품상세정보
                        cols[8],  # 비고
                        source_file=os.path.basename(f)
                    )
                    self.medicine_map.append(m)

                    if line_no <= 5:
                        print("▶ parsed row:", cols)

            print(f"✅ {f} 로드 완료, 총 {len(self.medicine_map)} 개")

    def find_by_name(self, name: str):
        q = self.normalize(name)
        return [m for m in self.medicine_map if self.normalize(m.item_name) == q]



    def search_by_partial_name(self, name: str):
        normalized_name = self.normalize(name)
        q = name.strip().lower()
        print(f"normalized_name = {normalized_name}")

        matches = [m for m in self.medicine_map if q in m.item_name.lower()]

        grouped = defaultdict(lambda: {"detail": set(), "source_file": set()})
        for m in matches:
            base_name = re.sub(r"\d+밀리그램.$", "", m.item_name).strip()
            grouped[base_name]["detail"].add(m.insurance)
            grouped[base_name]["source_file"].add(m.source_file)

        result = []
        for item_name, info in grouped.items():
            result.append({
                "item_name": item_name,
                "detail": " / " .join(info["detail"]),
                "source_file": list(info["source_file"]),
            })

        print(result)

        return result

        # for m in self.medicine_map:
        #     normalized_item = self.normalize(m.item_name)
        #     if normalized_name in normalized_item:
        #         print(f"✅ 매칭됨 :  {m.item_name}")
        #         yield m



    def debug_find(self, query: str):
        q_trim = query.strip()
        q_lower = q_trim.lower()
        q_norm = self.normalize(q_trim)

        print(f"▶ debugFind - raw query: [{query}]")
        print(f"   trimmed: [{q_trim}]")
        print(f"   lower: [{q_lower}]")
        print(f"   normalized: [{q_norm}]")

        for i, m in enumerate(self.medicine_map[:20]):
            print(i, "item_name_repr:", repr(getattr(m, "item_name", None)))
            print(" attrs:", m.__dict__)
            print("-" * 40)

        any_exact = any_ignore = any_norm = False
        for idx, m in enumerate(self.medicine_map):
            item = m.item_name or ""
            it_trim = item.strip()
            it_lower = it_trim.lower()
            it_norm = self.normalize(it_trim)

            if it_trim == q_trim:
                print(f"== exact match at index {idx}: [{item}]")
                any_exact = True
                break
            if not any_ignore and it_lower == q_lower:
                print(f"== equalsIgnoreCase match at index {idx}: [{item}]")
                any_ignore = True
            if not any_norm and it_norm == q_norm:
                print(f"== normalized-equals match at index {idx}: [{item}]")
                any_norm = True

        print(f"summary: exact={any_exact}, ignoreCase={any_ignore}, normalized={any_norm}")
