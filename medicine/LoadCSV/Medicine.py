from django.db import models

# Create your models here.

# medicine/Medicine.py
from django.db import models

class Medicine(models.Model):
    item_name = models.CharField(max_length=255)  # 이름
    efficacy = models.TextField(blank=True, null=True)  # 효과
    salary_or_not = models.TextField(blank=True, null=True)  # 급여 여부
    note = models.TextField(blank=True, null=True)  # 비고
    business_name = models.CharField(max_length=255, blank=True, null=True)  # 업소명
    ingredient = models.CharField(max_length=255, blank=True, null=True)  # 성분 코드
    product = models.CharField(max_length=255, blank=True, null=True)  # 제품 코드
    date = models.CharField(max_length=50, blank=True, null=True)  # 공고일자
    number = models.CharField(max_length=50, blank=True, null=True)  # 공고번호
    detail = models.TextField(blank=True, null=True)  # 약품상세정보

    def __str__(self):
        return self.item_name
