import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-page-error',
    templateUrl: './page-error.component.html',
    styleUrls: ['./page-error.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageErrorComponent implements OnInit {
    constructor(
        private activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef) {}

    code = 0;
    codeToMessage = {
        404: 'Игра не найдена, проверьте ссылку или создайте новую',
        500: 'Что-то пошло не так...'
    };

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(value => {
            this.code = Number(value.get('code'));
            this.cd.markForCheck();
        });
    }

}
